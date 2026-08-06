import { PrismaClient } from "../../generated/prisma/client";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
    constructor () {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL as string
        })
        super({
            adapter,
            log: ['error' , 'info' , 'warn']
        })
    }
    async onModuleInit() {
        await this.$connect();
        console.log("database connected")
    }
    async onModuleDestroy (){
        await this.$disconnect();
        console.log("there was an error on connect to database")
    }
}
