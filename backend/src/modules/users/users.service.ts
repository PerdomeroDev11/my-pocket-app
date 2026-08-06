import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService
    ){}
    async createUser(dto: CreateUserDto):Promise<UserEntity>{
        const user = await this.prisma.user.create({
            data:{
                name: dto.name,
                email: dto.email,
                password: dto.password
            }
        });
        return new UserEntity(user)
    }
    async findByEmail(email:string):Promise<UserEntity>{
        const user = await this.prisma.user.findUnique({
            where:{
                email:email
            },
            
        });
        if(!user) throw new NotFoundException('user not found')
        return new UserEntity(user)
    }
    async findbyId(userId: string):Promise<UserEntity>{
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId
            },
        });
        if(!user) throw new NotFoundException('user not found')
        return new UserEntity(user)
    }
    async findOnlyForLogin(email: string):Promise<{password: string | null}>{
        const user = await this.prisma.user.findUnique({
            where:{
                email:email
            },
            select:{
                password: true
            }
        });
        if(!user) throw new NotFoundException('user not found')
        return user
    }
}
