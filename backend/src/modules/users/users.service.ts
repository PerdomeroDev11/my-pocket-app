import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma-config/prisma.service';
import { UserResponseEntity, UserSessionResponseEntity } from './entity/user.entity';
import { ChangePasswordDto, UpdateUserdto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'
import { ImageProcessorService } from '@/storage/image-processor.service';
import { StorageService } from '@/storage/storage.service';
import 'multer'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private imageProccessor: ImageProcessorService,
        private storageService: StorageService
    ){}
    async changePassword(userId: string ,dto: ChangePasswordDto){
        if(dto.confirmPassword !== dto.passwordNew) throw new BadRequestException('the new passwords do not match')
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
    async findOneUser(userId: string):Promise <UserResponseEntity>{
        const user = await this.prisma.user.findUnique({where:{id: userId}})
        if(!user) throw new BadRequestException('user not found')
        return new UserResponseEntity(user)
    }
    async findAllSessionsUser(userId: string):Promise<UserSessionResponseEntity[]>{
        const sessionUser = await this.prisma.userSession.findMany({where:{userId: userId , status: "ON"}})
        return sessionUser.map(session => new UserSessionResponseEntity(session))
    }
    async updateUser(dto: UpdateUserdto , userId: string):Promise<UserResponseEntity>{
        const update = await this.prisma.user.update({
            where:{id: userId},
            data:{...dto, updatedAt: new Date()}
        })
        return new UserResponseEntity(update)
    }
    async uploadProfilePicture(userId: string , file: Express.Multer.File){
        const proccessed = await this.imageProccessor.processAvatar(file.buffer);
        const url = await this.storageService.upload(proccessed , `avatars/${userId}`)

        const updated = await this.prisma.user.update({
            where:{id:userId},
            data:{profilePicture: url}
        })
        return {profilePicture: updated.profilePicture}
    }
    async getUser(userId: string){
        const user = await this.prisma.user.findUnique({where:{id: userId}})
        if(!user) throw new BadRequestException('user not found')
        const {password , ...withoutPassword} = user
        return withoutPassword
    }
    
}
