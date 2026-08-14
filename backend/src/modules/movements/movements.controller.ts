import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards } from "@nestjs/common";
import { MovementsService } from "./movements.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreateMovementsDto } from "./dto/create-movements.dto";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { UpdateMovementsDto } from "./dto/update-movements.dto";
import { FindMovementsQueryDto } from "./dto/find-movements.dto";

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController{
    constructor (private movementsService: MovementsService){}

    @Post('create/:pageId/categories/:categoryId/balanceSection/:balanceSectionId')
    async createMovement(
        @Body() dto: CreateMovementsDto,
        @CurrentUser('sub') userId: string,
        @Param('pageId') pageId: string,
        @Param('balanceSectionId') balanceSectioId: string,
        @Param('categoryId') categoryId: string,
    ){
        return await this.movementsService.createMovement(dto, categoryId,pageId,userId,balanceSectioId)
    }
    @Put('update/:pageId/categories/:categoryId/balanceSection/:balanceSectionId/movement/:id')
    async updateMovement(
        @Body() dto: UpdateMovementsDto,
        @CurrentUser('sub') userId: string,
        @Param('pageId') pageId: string,
        @Param('balanceSectionId') balanceSectioId: string,
        @Param('categoryId') categoryId: string,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ){
        return await this.movementsService.updateMovement(dto,id,userId,file)
    }
    @Get('page/:id')
    async getMovements(
        @Query() dto: FindMovementsQueryDto,
        @Param('id') pageId:string,
        @CurrentUser('sub') userId: string 
    ){
        return await this.movementsService.getMovements(pageId, dto, userId)
    }
    @Delete(':id/page/:pageId/categories/:categoryId')
    async deleteMovement(
        @Param('id') id: string,
        @Param('pageId') pageId: string,
        @Param('categoryId') catregoryId: string,
        @CurrentUser('sub') userId: string
    ){
        return await this.deleteMovement(id,pageId,catregoryId,userId)
    }
}