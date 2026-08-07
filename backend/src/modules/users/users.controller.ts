import { Body, Controller, Patch, Post, UseGuards , Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChangePasswordDto } from './dto/update-user.dto';
import { CurrentUser } from '@/common/decorator/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
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
}
