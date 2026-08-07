import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma-config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { ChangePasswordDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService
    ){}
    async changePassword(userId: string ,dto: ChangePasswordDto){
        if(dto.confirmPassword !== dto.confirmPassword) throw new BadRequestException('the new passwords do not match')
        const user = await this.prisma.user.findUnique({
            where:{id: userId},
            select:{password: true , id:true}
        })
        if(!user) throw new BadRequestException('user not found')
        if(!user.password) throw new BadRequestException('password not found')
        const isPasswordValid = await bcrypt.compare(dto.password , user.password)
        
        if(!isPasswordValid) throw new UnauthorizedException('incorrect credentials')

        const passwordNewHashe = await bcrypt.hash(dto.passwordNew, 10)

        await this.prisma.user.update({
            where:{id: user.id},
            data:{password: passwordNewHashe}
        })
        return {message: 'change passoword successfully'}        
    }
    
}
