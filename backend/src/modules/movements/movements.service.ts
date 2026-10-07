import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
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
        private readonly prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        private imaggeProccess: ImageProcessorService,
        private storageService: StorageService
    ) { }

    async createMovement(
        dto: CreateMovementsDto,
        categoryId: string,
        pageId: string,
        userId: string,
    ) {
        await this.verifyCategoryOwnership(categoryId, userId);

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

            if (dto.isPay ) {
                
                await this.validateEnoughAvailableBalance(userId, dto.amount);
                await this.operationMovements(
                    dto.typeMovement,
                    userId,
                    dto.institutionFinancialId,
                    new Prisma.Decimal(String(dto.amount)),
                    tx,
                    dto.isPay,
                    pageId
                );
            }

            return newMovement;
        });
        await this.invalidateCache(userId, createdMovement.id,pageId)

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
        pageId: string,
        file?: Express.Multer.File
    ) {
        const movements = await this.findAndVerifyOwnership(id, userId);
        const updateData: Prisma.MovementsUpdateInput = {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
            ...(dto.amount !== undefined || dto.isPay !== null? { amount: dto.amount } : {}),
            ...(dto.date ? { date: new Date(dto.date) } : {}),
            ...(dto.isPay !== undefined || dto.isPay !== null? { isPay: dto.isPay } : {}),
            ...(dto.typeMovement ? { typeMovement: dto.typeMovement } : {}),
            ...(dto.institutionFinancialId !== undefined ? { institutionFinancialId: dto.institutionFinancialId ?? null } : {}),
        };

        if (file?.buffer) {
            const processed = await this.imaggeProccess.processReceipt(file.buffer);
            const url = await this.storageService.upload(processed, `avatars/${userId}`);
            updateData.receipUrl = url;
        }
        const effectiveAmount = dto.amount !== undefined ? new Prisma.Decimal(String(dto.amount)) : new Prisma.Decimal(String(movements.amount));

        const isTryingToPay = dto.isPay === true;
        const isAlreadyPaidAndEditingAmount = movements.isPay && (dto.amount !== undefined || dto.typeMovement !== undefined);
        const hasPaidToggle = dto.isPay !== undefined || dto.isPay !== null && dto.isPay !== movements.isPay;

        if (isTryingToPay || isAlreadyPaidAndEditingAmount) {
            await this.validateEnoughAvailableBalance(userId, effectiveAmount);
        }


        if (hasPaidToggle) {
            await this.updateIsPaied(userId, dto, id,pageId);
        }
        const update = await this.prisma.movements.update({
            where: { id: movements.id },
            data: updateData
        });

        await this.invalidateCache(userId, id,pageId)

        return update;
    }

    async getMovements(pageId: string, query: FindMovementsQueryDto, userId: string): Promise<Movements[]> {
        const cacheKey = `movements:${userId}:${pageId}:${JSON.stringify(query)}`;
        const cacheData = await this.redis.get(cacheKey);

        if (cacheData) return JSON.parse(cacheData);

        const movements = await this.prisma.movements.findMany({
            where: {
                category: { userId },
                ...(query.categoryId && { categoryId: query.categoryId }),
                ...(query.typeMovement && { typeMovement: query.typeMovement }),
                financialPageId: pageId
            },
            orderBy: { date: 'desc' }
        });
        await this.redis.set(cacheKey, JSON.stringify(movements));
        return movements;
    }

    async deleteMovement(id: string, userId: string, dto: DeleteMovementDto, pageId: string, categoryId: string) {
        const movement = await this.findAndVerifyOwnership(id, userId);
        await this.deleteIsPaied(userId, dto, id , pageId)
        const deleteMovement = await this.prisma.movements.delete({
            where: { id: movement.id, financialPageId: pageId, categoryId: categoryId }
        })

        await this.invalidateCache(userId, id,pageId)

        return { message: 'Movement deleted successfully', deleteMovement };
    }
    private  async invalidateCache(
        userId: string,
        id: string,
        pageId: string
    ){
        const cacheMovements = `movements:${userId}:${pageId}`
        const cacheMovement = `movement:${id}`
        const cacheCategory = `category:${userId}`
        const cacheCategoryWithPage = `category:${userId}:${pageId}`
        const cacheBalance = `balance${userId}`

        await this.redis.del(cacheMovements);
        await this.redis.del(cacheMovement);
        await this.redis.del(cacheCategory);
        await this.redis.del(cacheCategoryWithPage);
        await this.redis.del(cacheBalance);
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
   
    private async validateEnoughAvailableBalance(
        userId: string,
        amount: Prisma.Decimal | number,
    ) {
        const availableBalance = await this.prisma.balanceSection.findFirst({
            where: { userId, nameBalance: 'AVAILABLE' },
        });

        if (!availableBalance) {
            throw new NotFoundException('Available balance not found');
        }

        const currentAvailable = new Prisma.Decimal(String(availableBalance.balance).replace(/,/g, ''));
        const movementAmount = new Prisma.Decimal(String(amount).replace(/,/g, ''));

        if (movementAmount.greaterThan(currentAvailable)) {
            throw new BadRequestException(
                'The value does not reach enough to pay for this movement',
            );
        }
    }

    private async updateIsPaied(userId: string, dto: UpdateMovementsDto, id: string , pageId: string) {
        const movements = await this.findAndVerifyOwnership(id, userId);
        
        if (dto.isPay === undefined || dto.isPay === null) {
            throw new BadRequestException('is pay must not be undefined or null');
        }
        let isPaid:boolean = dto.isPay

        const amount = dto.amount !== undefined || dto.amount !== null ? new Prisma.Decimal(String(dto.amount)) : new Prisma.Decimal(String(movements.amount));
        if (dto.isPay === true) {
            await this.validateEnoughAvailableBalance(userId,  amount);
        }
        const institutionId =  dto.institutionFinancialId ;
        await this.prisma.$transaction(async (tx) => {
            await this.operationMovements(
                movements.typeMovement,
                userId,
                institutionId,
                amount,
                tx,
                isPaid,
                pageId
            );
        });
    }
    private async deleteIsPaied(userId: string, dto: DeleteMovementDto, id: string,pageId) {
        const movements = await this.findAndVerifyOwnership(id, userId);

        if (!movements.isPay) {
            return false;
        }

        await this.prisma.$transaction(async (tx) => {
            await this.operationMovements(
                movements.typeMovement,
                userId,
                movements.institutionFinancialId ?? null,
                new Prisma.Decimal(String(movements.amount)),
                tx,
                movements.isPay,
                pageId
            );
        });

        return true;
    }
    private async operationMovements(
        typeMovement: TypeMovement,
        userId: string,
        institutionId: string | null ,
        amount: Prisma.Decimal,
        tx: Prisma.TransactionClient,
        reversePaid: boolean,
        pageId: string
    ) {
        let amountPaid = amount
        // If 'reversePaid' is false, negate the amount to reuse 
        // the switch logic for reversal operations (deleting/undoing payments).
        if(reversePaid === false){
            amountPaid = amount.negated()
        }
        switch (typeMovement){
            case 'INCOME':
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                    data: { balance: { increment: amountPaid } }
                });
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                    data: { balance: { increment: amountPaid } }
                });
                if (institutionId) {
                    await tx.financialInstitutions.update({
                        where: { userId, id: institutionId },
                        data: { balanceNow: { increment: amountPaid } }
                    });
                }
                await tx.financialPages.update({
                    where: { id: pageId },
                    data: {
                        totalIncome: {increment: amountPaid },
                    }
                })
                break;
            case 'EXPENSE':
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                    data: { balance: { decrement: amountPaid } }
                });
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'TOTAL' } },
                    data: { balance: { decrement: amountPaid } }
                });
                if (institutionId) {
                    await tx.financialInstitutions.update({
                        where: { userId, id: institutionId },
                        data: { balanceNow: { decrement: amountPaid } }
                    });
                }
                await tx.financialPages.update({
                    where: { id: pageId },
                    data: {
                        totalExpenses: {increment: amountPaid },
                    }
                })
                break;
            case 'SAVING':
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                    data: { balance: { decrement: amountPaid } }
                });
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'SAVINGS' } },
                    data: { balance: { increment: amountPaid } }
                });
                if (institutionId) {
                    await tx.financialInstitutions.update({
                        where: { userId, id: institutionId },
                        data: { balanceNow: { increment: amountPaid } }
                    });
                }
                break;
            case 'INVESTMENT':
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'AVAILABLE' } },
                    data: { balance: { decrement: amountPaid } }
                });
                await tx.balanceSection.update({
                    where: { userId_nameBalance: { userId, nameBalance: 'INVESTMENTS' } },
                    data: { balance: { increment: amountPaid } }
                });
                if (institutionId) {
                    await tx.financialInstitutions.update({
                        where: { userId, id: institutionId },
                        data: { balanceNow: { decrement: amountPaid } }
                    });
                }
                break;
            default:
                console.log('an error in operation movements')
                return
        }
    }
}