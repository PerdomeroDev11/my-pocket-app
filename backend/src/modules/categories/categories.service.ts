import { Injectable , Inject, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import { CreateCategoryDto } from "./dto/create-categorie.dto";
import Redis from "ioredis";  
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { DEFAULT_CATEGORIES } from "@/common/constants/defaul-categories";

@Injectable()
export class CategoriesService {
    constructor (
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){}
    async createTemplateDefault(userId:string){
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
       const categoryString = JSON.stringify(category)
       await this.redis.del(`category:${category.id}`)
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
       const updateCategoryString = JSON.stringify(updateCategory)
        await this.redis.set(`category:${id}` , updateCategoryString)
        return updateCategory       
    }
    async showCategories(userId: string , financialPageId: string){
        const cacheData = await this.redis.get(`category:${userId}`)
        if(cacheData) return JSON.parse(cacheData)
        const categories = await this.prisma.categories.findMany({
            where:{userId: userId, status: 'ACTIVE'},
            include:{
                movements:{
                    where:{financialPageId}
                }
            },
            orderBy:{createdAt: 'asc'}
        })
        await this.redis.set(`category:${userId}` , JSON.stringify(categories))
        return categories
    }
    async solfDelete(userId: string , id:string){
        await this.redis.del(`category:${userId}`)
        return this.prisma.categories.update({
            where:{userId , id},
            data:{status: "DELETED"}
        });
        
    }

}