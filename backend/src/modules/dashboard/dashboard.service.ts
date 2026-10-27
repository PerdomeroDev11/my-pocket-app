import { PrismaService } from "@/prisma-config/prisma.service";
import {  Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { DatesDashboardDto } from "./dto/dashboard.dto";

@Injectable()
export class DashboardService {
    constructor(
        private readonly  prisma: PrismaService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){}

    async kpiCards(dto: DatesDashboardDto){
        const averageExpenses = await this.prisma.movements
    }
}