import { Body, Controller, Patch ,UseGuards , Get, Put, UploadedFile, UseInterceptors} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto, UpdateUserdto } from './dto/update-user.dto';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { PayloadValidateDto } from '../auth/dto/jwt.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private userService: UsersService
    ){}

    @Patch('change-password')
    async changePassword(
        @Body() dto: ChangePasswordDto,
        @CurrentUser('sub') userId: string
    ){
        return await this.userService.changePassword(userId,dto);
    }
    @Get('show-user')
    async findOneUser(
        @CurrentUser('sub') userId: string
    ){
        return await this.userService.findOneUser(userId)
    }
    @Get('sessions')
    async sessionsUser(
        @CurrentUser() paylod: PayloadValidateDto,
    ){
        return await this.userService.findAllSessionsUser(paylod.sub,paylod.jti)
    }
    @Put('edit-user')
    async editUser(
        @Body() dto: UpdateUserdto,
        @CurrentUser('sub') userId:string
    ){
        return await this.userService.updateUser(dto, userId)
    }
    @Patch('me/profile-picture')
    @UseInterceptors(FileInterceptor('file'))
    async profilePicture(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('sub') userId:string
    ){
        return this.userService.uploadProfilePicture(userId, file)
    }
    @Get('me')
    async getUSer(
        @CurrentUser('sub') userId: string,
    ){
        return await this.userService.getUser(userId)
    }

}
