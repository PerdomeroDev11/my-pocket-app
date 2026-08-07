import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma-config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { use } from 'passport';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService
    ){}
    
}
