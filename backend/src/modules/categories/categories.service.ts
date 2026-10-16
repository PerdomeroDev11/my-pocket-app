import { Injectable , Inject, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import { CreateCategoryDto } from "./dto/create-categorie.dto";
import Redis from "ioredis";  
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { DEFAULT_CATEGORIES } from "@/common/constants/defaul-categories";
import { moveMessagePortToContext } from "node:worker_threads";

@Injectable()
export class CategoriesService {
    constructor (
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ){}

    private async invalidateCategoryCache(userId: string) {
        const pageCaches = await this.redis.keys(`category:${userId}:*`);
        const cacheKeys = [`category:${userId}`, ...pageCaches];

        await Promise.all(cacheKeys.map((key) => this.redis.del(key)));
    }

    async createTemplateDefault(userId:string){
        await this.invalidateCategoryCache(userId)
        return this.prisma.categories.createMany({
            data: DEFAULT_CATEGORIES.map((cat) => ({
                userId,
                name: cat.name,
                isRecurrent: cat.isRecurrent,
            }))
        })
    }

    async createCategory(dto: CreateCategoryDto ,userId: string){
       const category = await this.prisma.categories.create({
        data:{
            ...dto,
            userId
        }
       })
       if(!category) throw new BadRequestException('there was an error to create a new category')
       await this.invalidateCategoryCache(userId)
       return category
    }
    async updateCategory(dto: UpdateCategoryDto , id:string, userId:string){
       const updateCategory = await this.prisma.categories.update({
        where:{id:id , userId},
        data:{
            ...dto
        }
       });
       if(!updateCategory) throw new BadRequestException('there was an error to update category')
        await this.invalidateCategoryCache(userId)
        return updateCategory       
    }
    async showCategories(userId: string , financialPageId: string){
        const cacheKey = `category:${userId}:${financialPageId}`
        const cacheCategory = `category:${userId}`
        const cacheData = await this.redis.get(cacheKey)
        if(cacheData) return JSON.parse(cacheData)
        const categories = await this.prisma.categories.findMany({
            where:{userId: userId, status: 'ACTIVE'},
            include:{
                movements:{
                    where:{financialPageId: financialPageId},
                    include:{
                        institutionFinancial: true,
                    }
                }
            },
            orderBy:{createdAt: 'asc'}
        })
        await this.redis.set(cacheKey , JSON.stringify(categories))
        await this.redis.set(cacheCategory , JSON.stringify(categories))
        return categories
    }
    async solfDelete(userId: string , id:string){
        await this.invalidateCategoryCache(userId)
       const hasPaidMovement = await this.prisma.movements.findFirst({
            where: { 
                categoryId: id,
                isPay: true 
            }
        });
        if (hasPaidMovement) {
            throw new BadRequestException('The category cannot be deleted because it has paid transactions.');
        }
        return this.prisma.categories.update({
            where:{userId , id},
            data:{status: "DELETED"}
        });
    }

}