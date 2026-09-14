import { 
    Body, 
    Controller, 
    UseGuards , 
    Post,
    Get,
    Put,
    Param,
    Patch
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreateCategoryDto } from "./dto/create-categorie.dto";
import { CurrentUser } from "@/common/decorator/current-user.decorator";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private categoriesService: CategoriesService){}

    @Post('create')
    async createNewCategory(
        @Body() dto: CreateCategoryDto,
        @CurrentUser('sub') userId: string,
    ){
        return await this.categoriesService.createCategory(dto, userId);
    }
    @Get('/page/:pageId')
    async getAllCategories(
        @CurrentUser('sub') userId:string,
        @Param('pageId') pageId: string
    ){
        return await this.categoriesService.showCategories(userId , pageId)
    }
    @Put(':id')
    async updateCategory(
        @Body() dto: UpdateCategoryDto,
        @CurrentUser('sub') userId: string,
        @Param('id') id: string
    ){
        return this.categoriesService.updateCategory(dto, id , userId)
    }
    @Patch('delete/:id')
    async deleteCategory(
        @CurrentUser('sub') userId: string,
        @Param('id') id: string
    ){
        this.categoriesService.solfDelete(userId,id)
    }
}