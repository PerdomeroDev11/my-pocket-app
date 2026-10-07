import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MovementsService } from "./movements.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreateMovementsDto } from "./dto/create-movements.dto";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { DeleteMovementDto, UpdateMovementsDto } from "./dto/update-movements.dto";
import { FindMovementsQueryDto } from "./dto/find-movements.dto";

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController{
    constructor (private movementsService: MovementsService){}

    @Post('create/:pageId/categories/:categoryId')
    async createMovement(
        @Body() dto: CreateMovementsDto,
        @CurrentUser('sub') userId: string,
        @Param('pageId') pageId: string,
        @Param('categoryId') categoryId: string,
    ){
        return await this.movementsService.createMovement(dto, categoryId,pageId,userId)
    }
    @Put('update/:pageId/categories/:categoryId/movement/:id')
    @UseInterceptors(FileInterceptor('file'))
    async updateMovement(
        @Body() dto: UpdateMovementsDto,
        @CurrentUser('sub') userId: string,
        @Param('pageId') pageId: string,
        @Param('categoryId') categoryId: string,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ){
        return await this.movementsService.updateMovement(dto,id,userId,pageId,file)
    }
    @Get('page/:id')
    async getMovements(
        @Query() dto: FindMovementsQueryDto,
        @Param('id') pageId:string,
        @CurrentUser('sub') userId: string 
    ){
        return await this.movementsService.getMovements(pageId, dto, userId)
    }
    @Patch(':id/page/:pageId/categories/:categoryId')
    async deleteMovement(
        @Param('id') id: string,
        @Param('pageId') pageId: string,
        @Param('categoryId') categoryId: string,
        @CurrentUser('sub') userId: string,
        @Body() dto: DeleteMovementDto
    ){
         return await this.movementsService.deleteMovement(id, userId, dto, pageId, categoryId);
    }
}