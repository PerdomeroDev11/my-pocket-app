import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { CreateMovementsDto } from "./dto/create-movements.dto";
import { UpdateMovementsDto } from "./dto/update-movements.dto";
import { FindMovementsQueryDto } from "./dto/find-movements.dto";
import { ImageProcessorService } from "@/storage/image-processor.service";
import { StorageService } from "@/storage/storage.service";

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
        balanceSectionId: string
    ) {
        await this.verifyCategoryOwnership(categoryId, userId);
        const newMovement = await this.prisma.movements.create({
            data: {
                ...dto,
                financialPageId: pageId,
                categoryId: categoryId,
                balanceSectionId: balanceSectionId
            }
        });

        if (!newMovement) throw new BadRequestException('There was an error creating a new movement');

        await this.redis.del(`movements:${userId}:${pageId}`);
        await this.redis.del(`verifyCategory:${categoryId}`);

        return newMovement;
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
        
        const updateMovement = await this.prisma.$transaction(async (tx) => {
            let newIsPay = movements.isPay;

            if (dto.isPay !== undefined && dto.isPay !== movements.isPay) {
                newIsPay = dto.isPay;
                const amount = movements.amount;

                if (movements.typeMovement === 'EXPENSE') {
                    if (newIsPay) {
                        await tx.balanceSection.update({
                            where: { id: movements.balanceSectionId },
                            data: { balance: { decrement: amount } }
                        });
                        if (movements.institutionFinancialId) {
                            await tx.financialInstitutions.update({
                                where: { id: movements.institutionFinancialId },
                                data: { balanceNow: { decrement: amount } }
                            });
                        }
                    } else {
                        await tx.balanceSection.update({
                            where: { id: movements.balanceSectionId },
                            data: { balance: { increment: amount } }
                        });
                        if (movements.institutionFinancialId) {
                            await tx.financialInstitutions.update({
                                where: { id: movements.institutionFinancialId },
                                data: { balanceNow: { increment: amount } }
                            });
                        }
                    }
                }

                if (movements.typeMovement === 'INCOME') {
                    if (newIsPay) {
                        await tx.balanceSection.update({
                            where: { id: movements.balanceSectionId },
                            data: { balance: { increment: amount } }
                        });
                        if (movements.institutionFinancialId) {
                            await tx.financialInstitutions.update({
                                where: { id: movements.institutionFinancialId },
                                data: { balanceNow: { increment: amount } }
                            });
                        }
                    } else {
                        await tx.balanceSection.update({
                            where: { id: movements.balanceSectionId },
                            data: { balance: { decrement: amount } }
                        });
                        if (movements.institutionFinancialId) {
                            await tx.financialInstitutions.update({
                                where: { id: movements.institutionFinancialId },
                                data: { balanceNow: { decrement: amount } }
                            });
                        }
                    }
                }
            }

            const updated = await tx.movements.update({
                where: { id },
                data: {
                    ...dto,
                    isPay: newIsPay,
                    receipUrl: url
                }
            });
            return updated;
        });

        if (!updateMovement) throw new BadRequestException('There was an error updating the movement');

        await this.redis.del(`movements:${userId}:${movements.financialPageId}`);
        await this.redis.del(`movement:${id}`);

        return updateMovement;
    }

    async getMovements(pageId: string, query: FindMovementsQueryDto, userId: string) {
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

        await this.redis.set(cacheKey, JSON.stringify(movements));
        return movements;
    }

    async deleteMovement(id: string, pageId: string, categoryId: string, userId: string) {
        const movement = await this.findAndVerifyOwnership(id, userId);
        
        await this.prisma.movements.delete({
            where: {
                id,
                financialPageId: pageId,
                categoryId: categoryId
            }
        });

        await this.redis.del(`movements:${userId}:${pageId}`);
        await this.redis.del(`movement:${id}`);

        return { message: 'Movement deleted successfully' };
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
}