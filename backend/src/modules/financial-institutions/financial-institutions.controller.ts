import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { FinancialInstitutionsService } from "./financial-institutions.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreateFinancialInstitutionDto } from "./dto/create-financial-institutions.dto";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { UpdateFinancialInstitutionsDto } from "./dto/update-financial-institutions.dto";
import path from "path";


@Controller('financial-institutions')
@UseGuards(JwtAuthGuard)
export class FinancialInstitutionsController{
    constructor(private financialInstitutions: FinancialInstitutionsService){}
    @Post('create')
    async create(
        @Body() dto: CreateFinancialInstitutionDto,
        @CurrentUser('sub') userId: string
    ){
        return await this.financialInstitutions.create(dto,userId)
    }
    @Get()
    async show(
        @CurrentUser('sub') userId: string
    ){
        return await this.financialInstitutions.show(userId)
    }
    @Put(':id')
    async update (
        @Body() dto: UpdateFinancialInstitutionsDto,
        @CurrentUser('sub') userId: string,
        @Param('id') id: string
    ){
        return await this.financialInstitutions.update(dto,userId,id)
    }
    @Patch('/desative/:id')
    async desactive(
        @CurrentUser('sub') userId:string,
        @Param('id') id: string
    ){
        return await this.financialInstitutions.desative(userId,id)
    }
    @Patch('/active/:id')
    async active(
        @CurrentUser('sub') userId:string,
        @Param('id') id: string
    ){
        return await this.financialInstitutions.active(userId,id)
    }

}