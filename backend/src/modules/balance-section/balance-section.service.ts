import { Injectable , Inject, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/prisma-config/prisma.service";
import Redis from "ioredis";
import { use } from "passport";
import { BalancesResponse } from "./entity/return.balance";

@Injectable()
export class BalanceSectionService{
    constructor (
        private prisma: PrismaService,
        @Inject('REDIS_CLIENT') private redis: Redis, 
    ){}
    async getBalanceAvailable(userId:string){
         await this.redis.del(`balance${userId}`)
        
       
        console.log('userId: ', userId)
        const balanaceAll = await this.prisma.balanceSection.findMany({where:{userId}})
        if(!balanaceAll) throw new BadRequestException('there was an error in get balance available')
        return balanaceAll
    }
}