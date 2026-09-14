import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { CreateMovementsDto } from "./dto/create-movements.dto";
import { UpdateMovementsDto } from "./dto/update-movements.dto";
import { FindMovementsQueryDto } from "./dto/find-movements.dto";
import { ImageProcessorService } from "@/storage/image-processor.service";
import { StorageService } from "@/storage/storage.service";
import { Prisma } from "@generated/prisma/client";
import { Movements } from "@generated/prisma/browser";

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

        const movementDescription = dto.description ?? dto.name ?? 'Movimiento';

        const createNewMovement = await this.prisma.movements.create({
            data:{
                financialPageId: pageId,
                categoryId: categoryId,
                institutionFinancialId: dto.institutionFinancialId,
                name: dto.name,
                description: movementDescription,
                amount: dto.amount,
                date: dto.date ? new Date(dto.date) : new Date(),
                isPay: dto.isPay,
                typeMovement: dto.typeMovement
            }
        })
        await this.logicCreatedMovement( categoryId , pageId);
        await this.redis.del(`movements:${userId}:${createNewMovement.financialPageId}`);
        await this.redis.del(`movement:${createNewMovement.id}`);
        await this.redis.del(`category:${userId}`);
        await this.redis.del(`category:${userId}:${pageId}`);

        return {
            ...createNewMovement,
            name: dto.name ?? movementDescription,
            description: movementDescription,
        };
    }

    async updateMovement(
        dto: UpdateMovementsDto, 
        id: string, 
        userId: string, 
        file : Express.Multer.File
    ) {
        const movements = await this.findAndVerifyOwnership(id, userId);
        const proccessed = await this.imaggeProccess.processReceipt(file.buffer);
        const url = await this.storageService.upload(proccessed , `avatars/${userId}`)
        
        const update = await this.prisma.movements.update({
            where:{id: movements.id },
            data:{
                ...dto,
                receipUrl: url
            }
        });
       await this.updateIsPaied(userId , dto , id)
        

        if (!update) throw new BadRequestException('There was an error updating the movement');

        await this.redis.del(`movements:${userId}:${movements.financialPageId}`);
        await this.redis.del(`movement:${id}`);

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

    async deleteMovement(id: string, userId: string , dto:UpdateMovementsDto , pageId:string , categoryId:string) {
        const movement = await this.findAndVerifyOwnership(id, userId);
        await this.deleteIsPaied(userId , dto , id)
        const deleteMovement = await this.prisma.movements.delete({
            where:{id:movement.id , financialPageId: pageId, categoryId:categoryId}
        })

        await this.redis.del(`movements:${userId}:${pageId}`);
        await this.redis.del(`movement:${id}`);

        return { message: 'Movement deleted successfully' , deleteMovement };
    }

    private async findAndVerifyOwnership(id: string, userId: string) {
        const cacheKey = `movement:${id}`;
        const cacheData = await this.redis.get(cacheKey);

        if (cacheData) {
            const movement = JSON.parse(cacheData);
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

        await this.redis.set(cacheKey, JSON.stringify(movement));
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
                        typeMovement: 'INCOME'
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
    private async updateIsPaied(userId:string , dto: UpdateMovementsDto , id: string){
        const movements = await this.findAndVerifyOwnership(id, userId);
        const updateLogic = await this.prisma.$transaction(async (tx) => {
            let newIsPay: boolean = movements.isPay;

            if (dto.isPay !== undefined && dto.isPay !== movements.isPay) {
                newIsPay = dto.isPay;
                let delta:Prisma.Decimal  = movements.amount;
                const institutoId = movements.financialInstitutionId;
                const balanceSectionId = movements.balanceSectionId;

                if(newIsPay){
                    if(dto.typeMovement === 'EXPENSE'){
                        delta = delta.negated()
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{decrement : delta}}
                        })
                    
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {decrement: delta}}
                            })
                        }
                    }
                    if(dto.typeMovement === 'SAVING'){
                        await tx.balanceSection.update({
                            where:{userId , id: balanceSectionId , nameBalance: 'SAVINGS'},
                            data:{balance: {increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{increment : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {decrement: delta}}
                            })
                        }
                    }

                    if(dto.typeMovement === 'INVESTMENT'){
                    
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: balanceSectionId , nameBalance: 'INVESTMENTS'},
                            data:{balance: {increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{increment : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {decrement: delta}}
                            })
                        }
                    }
                    if(dto.typeMovement === 'INCOME'){
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance:{increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{increment : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {decrement: delta}}
                            })
                        }
                    }
                }  
            }
        });
        return updateLogic
    }
    private async deleteIsPaied (userId:string, dto: UpdateMovementsDto , id:string){
         const movements = await this.findAndVerifyOwnership(id, userId);
        const deleteLogic = await this.prisma.$transaction(async (tx) => {
            let newIsPay: boolean = movements.isPay;

            if (dto.isPay !== undefined && dto.isPay !== movements.isPay) {
                newIsPay = dto.isPay;
                let delta:Prisma.Decimal  = movements.amount;
                const institutoId = movements.financialInstitutionId;
                const balanceSectionId = movements.balanceSectionId;

                if(newIsPay){
                    if(dto.typeMovement === 'EXPENSE'){
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{increment : delta}}
                        })
                    
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {increment: delta}}
                            })
                        }
                    }
                    if(dto.typeMovement === 'SAVING'){
                        await tx.balanceSection.update({
                            where:{userId , id: balanceSectionId , nameBalance: 'SAVINGS'},
                            data:{balance: {decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{decrement : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {increment: delta}}
                            })
                        }
                    }

                    if(dto.typeMovement === 'INVESTMENT'){
                    
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance: {increment: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: balanceSectionId , nameBalance: 'INVESTMENTS'},
                            data:{balance: {decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{decrement : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {increment: delta}}
                            })
                        }
                    }
                    if(dto.typeMovement === 'INCOME'){
                        await tx.balanceSection.update({
                            where:{userId: userId , id:balanceSectionId , nameBalance: 'AVAILABLE'},
                            data:{balance:{decrement: delta}}
                        })
                        await tx.balanceSection.update({
                            where:{userId , id: institutoId , nameBalance: 'TOTAL'},
                            data:{balance:{decrement : delta}}
                        })
                        if(institutoId){
                            await tx.financialInstitutions.update({
                                where:{ userId , id: institutoId },
                                data:{balanceNow: {increment: delta}}
                            })
                        }
                    }
                }  
            }return 
        });
        return deleteLogic
    }
}