import { Body, Controller, Get, Param, Patch, Post, UseGuards} from "@nestjs/common";
import { FinancialsPagesService } from "./financials-pages.service";
import { CreateFinancialPageDto } from "./dto/create-financial-page";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

@Controller('financial-pages')
@UseGuards(JwtAuthGuard)
export class FinancialPagesController{
    constructor (private financialPageService: FinancialsPagesService){}

    @Post('new-page')
    async newPage(
        @Body() dto: CreateFinancialPageDto,
        @CurrentUser('sub') userId: string
    ){
        return await this.financialPageService.createPage(dto,userId)
    }
    @Get('list')
    async allPage(
        @CurrentUser('sub') userId: string,
    ){
        return await this.financialPageService.getFinancialPages(userId)
    }
    @Get('last')
    async lastPage (
        @CurrentUser('sub') userId: string
    ){
        return await this.financialPageService.findLastPage(userId)
    }
    @Patch('change-status-page/:id')
    async changeStatus(
        @CurrentUser('sub') userId: string,
        @Param('id') id: string
    ){
        return await this.financialPageService.changeStatusPage(userId, id)
    }
}