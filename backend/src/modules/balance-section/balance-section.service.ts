import { Injectable , Inject, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { use } from "passport";

@Injectable()
export class BalanceSectionService{
    constructor (
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private redis: Redis, 
    ){}
    async getBalanceAvailable(userId:string){
        const cacheData = await this.redis.get(`balance${userId}`)
        if(cacheData){
            return JSON.parse(cacheData)
        }
        const balanaceAvalable = await this.prisma.balanceSection.findFirst({where:{userId , nameBalance: 'AVAILABLE'}})
        if(!balanaceAvalable) throw new BadRequestException('there was an error in get balance available')
        await this.redis.set(`balance${userId}` ,  JSON.stringify(balanaceAvalable))
        return balanaceAvalable
    }
}