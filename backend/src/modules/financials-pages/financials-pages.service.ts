import { Injectable , Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { CreateFinancialPageDto } from "./dto/create-financial-page";

@Injectable()
export class FinancialsPagesService {
    constructor (
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private redis: Redis
    ){}
    async createPage (dto:CreateFinancialPageDto,userId: string){
        
        const lastPageId = await this.findLastPage(userId)
        const page = await this.prisma.financialPages.create({
            data:{
                userId: userId,
                name: dto.name
            }
        })
        if(lastPageId){
            await this.cloneCategories(userId , lastPageId.id, page.id)
        }
        await this.redis.del(`financialPage${page.id}`)
        await this.redis.del(`userPages:${userId}`)
        await this.redis.del(`lastPage:${userId}`)
        
        return page
        
    }
    async findLastPage (userId: string):Promise<{id: string} | null>{
        const cacheData = await this.redis.get(`lastPage:${userId}`)
        if(cacheData){
            const parsed = JSON.parse(cacheData)
            return parsed
        }
        const lastPage = await this.prisma.financialPages.findFirst({
            where:{userId},
            orderBy: {createdAt: 'desc'},
            select: {id:true}
        })
        const lastPageId = lastPage || null
        await this.redis.set(`lastPage:${userId}` , JSON.stringify(lastPageId))
        return lastPageId
    }
    async getFinancialPages(userId:string ){
        const cacheData = await this.redis.get(`userPages:${userId}`)
        if(cacheData) {
            return JSON.parse(cacheData)
        }
        const userPages = await this.prisma.financialPages.findMany({
            where:{
                userId,
            },
            orderBy: {createdAt: 'desc'}
        })
        await this.redis.set(`userPages:${userId}`, JSON.stringify(userPages))
        return userPages
    }

    async changeStatusPage(userId:string , id:string){
        const changeStatus = await this.prisma.$transaction(async(tx) =>{
            const pageFound = await this.findPage(userId,id)

            if(pageFound.status === 'CLOSED'){
                const activePage= await  tx.financialPages.update({
                    where:{id, userId},
                    data:{
                        status: 'ACTIVE'
                    }
                })
                return activePage
            }else{
                const ClosedPage = await  tx.financialPages.update({
                    where:{id, userId},
                    data:{
                        closedAt: new Date(),
                        status: 'CLOSED'
                    }
                })
                return ClosedPage
            }
        })
        await this.redis.del(`financialPage${id}`)
        await this.redis.del(`userPages:${userId}`)
        await this.redis.del(`lastPage:${userId}`)
        console.log(changeStatus.status)
        return {status: changeStatus.status}
    }
    private async cloneCategories(userId: string ,previusPageId:string, newPageId: string ){
        const recurrentCategories = await this.prisma.categories.findMany({
            where:{ 
                userId,
                isRecurrent: true,
                status: 'ACTIVE'
            },
            include:{
                movements:{
                    where: {
                        financialPageId: previusPageId,
                    },
                    orderBy:{date: 'desc'},
                    take: 1
                }
            }
        });
        const movementsToCreate = recurrentCategories
        .filter((cat) => cat.movements.length > 0)
        .map((cat) => {
            const lastMovement = cat.movements[0]
            return{
                financialPageId: newPageId,
                categoryId: cat.id,
                institutionFinancialId: lastMovement.institutionFinancialId,
                balanceSectionId: lastMovement.balanceSectionId,
                description: lastMovement.description,
                amount: lastMovement.amount,
                expectAmount: lastMovement.expectAmount,
                date: new Date(),
                isPay: false,
                typeMovement: lastMovement.typeMovement
            };
        });
        if(movementsToCreate.length > 0) {
            await this.prisma.movements.createMany({
                data: movementsToCreate
            })
        }
        await this.redis.del(`movements:${userId}`)
        return {cloneAcount: movementsToCreate.length}
    }
    private async findPage(userId: string , id:string){
        if(id){
            const cacheData = await this.redis.get(`financialPage${id}`)
            if(cacheData){
                return JSON.parse(cacheData)
            }
        }
        const pageFound = await this.prisma.financialPages.findUnique({where:{id , userId}})
        if(!pageFound) throw new NotFoundException('page not found')
        await this.redis.set(`financialPage${id}` , JSON.stringify(pageFound))
        return pageFound
    }
    
}