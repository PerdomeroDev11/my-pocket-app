import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException} from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { CreateMovementsDto } from "./dto/create-movements.dto";
import { DeleteMovementDto, UpdateMovementsDto } from "./dto/update-movements.dto";
import { FindMovementsQueryDto } from "./dto/find-movements.dto";
import { ImageProcessorService } from "@/storage/image-processor.service";
import { StorageService } from "@/storage/storage.service";
import { Prisma } from "@generated/prisma/client";
import { Movements, TypeMovement } from "@generated/prisma/browser";

@Injectable()
export class MovementsService {
    constructor(
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private redis: Redis,
        private imaggeProccess : ImageProcessorService,
        private storageService: StorageService
    ) {}

    async createMovement(
        dto: CreateMovementsDto, 
        categoryId: string, 
        pageId: string, 
        userId: string, 
    ) {
       await this.verifyCategoryOwnership(categoryId, userId);

        if (dto.isPay) {
            await this.validateEnoughAvailableBalance(userId, dto.typeMovement, dto.amount);
        }

        const movementDescription = dto.description ?? dto.name ?? 'Movimiento';

        const createdMovement = await this.prisma.$transaction(async (tx) => {
            
            const newMovement = await tx.movements.create({
                data: {
                    financialPageId: pageId,
                    categoryId,
                    institutionFinancialId: dto.institutionFinancialId,
                    name: dto.name,
                    description: movementDescription,
                    amount: dto.amount,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    isPay: dto.isPay,
                    typeMovement: dto.typeMovement
                }
            });
     
    if (dto.isPay) {
      await this.applyBalanceEffect(
        tx,
        userId,
        dto.typeMovement,
        newMovement.amount,
        dto.institutionFinancialId ?? null,
      );
    }

    return newMovement;
  });
        if(!createdMovement) throw new BadRequestException('There was an error creating the movement');
        await this.logicCreatedMovement( categoryId , pageId);
        await this.redis.del(`movements:${userId}:${createdMovement.financialPageId}`);
        await this.redis.del(`movement:${createdMovement.id}`);
        await this.redis.del(`category:${userId}`);
        await this.redis.del(`category:${userId}:${pageId}`);
        await this.redis.del(`balance${userId}`);

        return {
            ...createdMovement,
            name: dto.name ?? movementDescription,
            description: movementDescription,
        };
    }

    async updateMovement(
        dto: UpdateMovementsDto, 
        id: string, 
        userId: string, 
        file?: Express.Multer.File
    ) {
        const movements = await this.findAndVerifyOwnership(id, userId);
        const updateData: Prisma.MovementsUpdateInput = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
            ...(dto.date ? { date: new Date(dto.date) } : {}),
            ...(dto.isPay !== undefined ? { isPay: dto.isPay } : {}),
            ...(dto.typeMovement ? { typeMovement: dto.typeMovement } : {}),
            ...(dto.institutionFinancialId !== undefined ? { institutionFinancialId: dto.institutionFinancialId ?? null } : {}),
        };

        if (file?.buffer) {
            const processed = await this.imaggeProccess.processReceipt(file.buffer);
            const url = await this.storageService.upload(processed, `avatars/${userId}`);
            updateData.receipUrl = url;
        }
        const effectiveTypeMovement = dto.typeMovement ?? movements.typeMovement;
        const effectiveAmount = dto.amount !== undefined ? new Prisma.Decimal(String(dto.amount)) : new Prisma.Decimal(String(movements.amount));

        const isTryingToPay = dto.isPay === true;
        const isAlreadyPaidAndEditingAmount = movements.isPay && (dto.amount !== undefined || dto.typeMovement !== undefined);
        const hasPaidToggle = dto.isPay !== undefined && dto.isPay !== movements.isPay;

        if (isTryingToPay || isAlreadyPaidAndEditingAmount) {
            await this.validateEnoughAvailableBalance(userId, effectiveTypeMovement, effectiveAmount);
        }

        const update = await this.prisma.movements.update({
            where:{id: movements.id },
            data: updateData
        });

        if (hasPaidToggle) {
            await this.updateIsPaied(userId , dto , id);
        }
        

        if (!update) throw new BadRequestException('There was an error updating the movement');

        await this.redis.del(`movements:${userId}:${movements.financialPageId}`);
        await this.redis.del(`movement:${id}`);
        await this.redis.del(`category:${userId}`);
        await this.redis.del(`category:${userId}:${movements.financialPageId}`);
        await this.redis.del(`balance${userId}`);

        return update;
    }

    async getMovements(pageId: string, query: FindMovementsQueryDto, userId: string):Promise<Movements[]>{
        const cacheKey = `movements:${userId}:${pageId}`;
        const cacheData = await this.redis.get(cacheKey);
        
        if (cacheData) return JSON.parse(cacheData);

        const movements = await this.prisma.movements.findMany({
            where: {
                category: { userId },
                ...(query.categoryId && { categoryId: query.categoryId }),
                ...(query.typeMovement && { typeMovement: query.typeMovement }),
                ...(query.startDate || query.endDate
                    ? {
                        date: {
                            ...(query.startDate && { gte: new Date(query.startDate) }),
                            ...(query.endDate && { lte: new Date(query.endDate) })
                        },
                    }
                    : {}
                ),
                financialPageId: pageId
            },
            orderBy: { date: 'desc' }
        });
        if(!movements) throw new BadRequestException('there was an error to get movements')
        await this.redis.set(cacheKey, JSON.stringify(movements));
        return movements;
    }

    async deleteMovement(id: string, userId: string , dto:DeleteMovementDto, pageId:string , categoryId:string) {
        const movement = await this.findAndVerifyOwnership(id, userId);
        await this.deleteIsPaied(userId , dto , id)
        const deleteMovement = await this.prisma.movements.delete({
            where:{id:movement.id , financialPageId: pageId, categoryId:categoryId}
        })

        await this.redis.del(`movements:${userId}:${pageId}`);
        await this.redis.del(`movement:${id}`);
        await this.redis.del(`category:${userId}`);
        await this.redis.del(`category:${userId}:${pageId}`);
        await this.redis.del(`balance${userId}`);

        return { message: 'Movement deleted successfully' , deleteMovement };
    }

    private async findAndVerifyOwnership(id: string, userId: string) {
        const cacheKey = `movement:${id}`;
        const cacheData = await this.redis.get(cacheKey);

        if (cacheData) {
            const movement = JSON.parse(cacheData);
            if (movement.amount !== undefined && movement.amount !== null) {
                movement.amount = new Prisma.Decimal(String(movement.amount));
            }
            if (movement.expectAmount !== undefined && movement.expectAmount !== null) {
                movement.expectAmount = new Prisma.Decimal(String(movement.expectAmount));
            }
            if (movement.category?.userId !== userId && movement.userId !== userId) {
                throw new ForbiddenException('You cannot access this movement');
            }
            return movement;
        }

        const movement = await this.prisma.movements.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!movement) throw new NotFoundException('Movement not found');
        if (movement.category.userId !== userId) throw new ForbiddenException('You cannot access this movement');

        await this.redis.set(
            cacheKey,
            JSON.stringify({
                ...movement,
                amount: movement.amount.toString(),
                expectAmount: movement.expectAmount ? movement.expectAmount.toString() : null,
            }),
        );
        return movement;
    }

    private async verifyCategoryOwnership(categoryId: string, userId: string) {
        const cacheKey = `category:${categoryId}`;
        const cacheData = await this.redis.get(cacheKey);

        if (cacheData) {
            const category = JSON.parse(cacheData);
            if (category.userId !== userId) throw new ForbiddenException('You cannot access this category');
            return category;
        }

        const category = await this.prisma.categories.findUnique({ where: { id: categoryId } });

        if (!category) throw new NotFoundException('Category not found');
        if (category.userId !== userId) throw new ForbiddenException('You cannot create movements in this category');

        await this.redis.set(cacheKey, JSON.stringify(category));
        return category;
    }
    private async logicCreatedMovement(
        categoryId: string, 
        pageId: string, 
    ){
        const newMovement = await this.prisma.$transaction(async (tx) => {
            const financialPage = await tx.financialPages.findUnique({where:{id: pageId}})

            if(!financialPage) throw new NotFoundException('financial page not found')
                const incomeAggregate = await tx.movements.aggregate({
                    where:{
                        financialPageId : pageId ,
                        categoryId: categoryId, 
                        typeMovement: 'INCOME',
                        isPay: true
                    },
                    _sum: {
                        amount: true
                    }
                });

                const expenseAggregate = await tx.movements.aggregate({
                    where:{
                        financialPageId: pageId,
                        categoryId: categoryId,
                        typeMovement: 'EXPENSE',
                        isPay: true
                    },
                    _sum:{amount:true}
                })

                const savingAggregate = await tx.movements.aggregate({
                    where:{
                        financialPageId: pageId,
                        categoryId: categoryId,
                        typeMovement: 'SAVING',
                        isPay:true
                    },
                    _sum:{amount:true}
                })
                const totalIncome =  incomeAggregate._sum.amount ?? new Prisma.Decimal(0)
                const totalExpenses = expenseAggregate._sum.amount ?? new Prisma.Decimal(0)
                const totalSavings = savingAggregate._sum.amount ?? new Prisma.Decimal(0)

                if(!totalIncome && !totalExpenses && !totalSavings) throw new BadRequestException('sss')

                await tx.financialPages.update({
                    where:{id: pageId},
                    data:{
                        totalIncome:  totalIncome,
                        totalExpenses: totalExpenses,
                    }
                })
        });
        
        return{
            message: 'movement correctly synchronized',
            movement: newMovement
        }
    }
    private async validateEnoughAvailableBalance(
        userId: string,
        typeMovement: TypeMovement,
        amount: Prisma.Decimal | number,
    ) {
        if (typeMovement === 'INCOME') {
            return;
        }

        const availableBalance = await this.prisma.balanceSection.findFirst({
            where: { userId, nameBalance: 'AVAILABLE' },
        });

        if (!availableBalance) {
            throw new NotFoundException('Available balance not found');
        }

        const currentAvailable = new Prisma.Decimal(String(availableBalance.balance ?? 0).replace(/,/g, ''));
        const movementAmount = new Prisma.Decimal(String(amount ?? 0).replace(/,/g, ''));

        if (movementAmount.greaterThan(currentAvailable)) {
            throw new BadRequestException(
                'The value does not reach enough to pay for this movement',
            );
        }
    }

    private async updateIsPaied(userId:string , dto: UpdateMovementsDto , id: string){
        const movements = await this.findAndVerifyOwnership(id, userId);

        if (dto.isPay === undefined || dto.isPay === movements.isPay) {
            return;
        }

        const effectiveAmount = dto.amount !== undefined ? new Prisma.Decimal(String(dto.amount)) : new Prisma.Decimal(String(movements.amount));
        if (dto.isPay === true) {
            await this.validateEnoughAvailableBalance(userId, dto.typeMovement ?? movements.typeMovement, effectiveAmount);
        }
        const institutionId = movements.institutionFinancialId;

        await this.prisma.$transaction(async (tx) => {
            if (dto.isPay) {
                await this.applyBalanceEffect(tx, userId, dto.typeMovement ?? movements.typeMovement, effectiveAmount, institutionId ?? null);
                return;
            }

            await this.reversePaidBalanceEffect(tx, userId, movements.typeMovement, effectiveAmount, institutionId ?? null);
        });
        await this.redis.del(`movement:${id}`);
    }
    private async deleteIsPaied (userId:string, dto: DeleteMovementDto , id:string){
        const movements = await this.findAndVerifyOwnership(id, userId);

        if (!movements.isPay) {
            return false;
        }

        await this.prisma.$transaction(async (tx) => {
            await this.reversePaidBalanceEffect(
                tx,
                userId,
                movements.typeMovement,
                new Prisma.Decimal(String(movements.amount)),
                movements.institutionFinancialId ?? null,
            );
        });

        await this.redis.del(`movement:${id}`);
        return true;
    }
    private async reversePaidBalanceEffect(
        tx: Prisma.TransactionClient,
        userId: string,
        typeMovement: TypeMovement,
        amount: Prisma.Decimal,
        institutionId: string | null,
    ) {
        if (typeMovement === 'EXPENSE') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { increment: amount } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { increment: amount } }
            });
            if (institutionId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutionId },
                    data: { balanceNow: { increment: amount } }
                });
            }
            return;
        }

        if (typeMovement === 'SAVING') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'SAVINGS' } },
                data: { balance: { decrement: amount } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { increment: amount } }
            });
            if (institutionId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutionId },
                    data: { balanceNow: { increment: amount } }
                });
            }
            return;
        }

        if (typeMovement === 'INVESTMENT') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { increment: amount } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'INVESTMENTS' } },
                data: { balance: { decrement: amount } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { decrement: amount } }
            });
            if (institutionId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutionId },
                    data: { balanceNow: { increment: amount } }
                });
            }
            return;
        }

        if (typeMovement === 'INCOME') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { decrement: amount } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { decrement: amount } }
            });
            if (institutionId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutionId },
                    data: { balanceNow: { decrement: amount } }
                });
            }
        }
    }
    private async applyBalanceEffect(
        tx: Prisma.TransactionClient,
        userId: string,
        typeMovement: TypeMovement,
        amount: Prisma.Decimal,
        institutoId: string | null,
    ) {
        console.log('institutoId: ' ,institutoId)
        let delta = amount;
        

        if (typeMovement === 'EXPENSE') {
            delta = delta.negated();

            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { increment: delta } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { increment: delta } }
            });

            if (institutoId) {
                console.log('id: ', institutoId)
                await tx.financialInstitutions.update({
                    where: { userId, id: institutoId },
                    data: { balanceNow: { increment: delta } }
                });
            }
        } 

        if (typeMovement === 'SAVING') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'SAVINGS' } },
                data: { balance: { increment: delta } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { decrement: delta } }
            });

            if (institutoId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutoId },
                    data: { balanceNow: { increment: delta } }
                });
            }
        }

        if (typeMovement === 'INVESTMENT') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { decrement: delta } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'INVESTMENTS' } },
                data: { balance: { increment: delta } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { increment: delta } }
            });

            if (institutoId) {
            await tx.financialInstitutions.update({
                where: { userId, id: institutoId },
                data: { balanceNow: { increment: delta } }
            });
            }
        }

        if (typeMovement === 'INCOME') {
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                data: { balance: { increment: delta } }
            });
            await tx.balanceSection.update({
                where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                data: { balance: { increment: delta } }
            });

            if (institutoId) {
                await tx.financialInstitutions.update({
                    where: { userId, id: institutoId },
                    data: { balanceNow: { increment: delta } } 
                });
            }
        }
    }
}