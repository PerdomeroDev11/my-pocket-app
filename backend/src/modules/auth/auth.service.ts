import { ConflictException, Inject, Injectable } from "@nestjs/common";
import {JwtService} from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt'
import { PrismaService } from "@/prisma-config/prisma.service";
import { UsersService } from "../users/users.service";
import { randomInt , randomUUID } from "crypto";
import { CreateUserPendingDto, GenerateTokenDto ,LoginDto} from "./dto/jwt.dto";
import geoip from 'geoip-lite';
import { ResendService } from "@/resend/resend.service";
import Redis from "ioredis";


@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private resendService: ResendService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){}
    private async generateTokens (dto: GenerateTokenDto):Promise<{accessToken:string , refreshToken:string}>{
        const accessToken = this.jwtService.sign(
            {
                sub: dto.userId,
                email: dto.email,
                jti: randomUUID(),
            },
            {
                secret: this.configService.get('jwt.accessSecret'),
                expiresIn: this.configService.get('jwt.accessExpiration')
            }
        );
        const refreshToken = this.jwtService.sign(
            {sub: dto.userId},
            {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiration')
            }
        );
        return {accessToken , refreshToken}
    }
    async session (dto: LoginDto): Promise<{accessToken:string , refreshToken: string}>{
        const {accessToken, refreshToken} = await this.generateTokens({userId: dto.userId , email: dto.email});

        const refreshHash = await bcrypt.hash(refreshToken , 10);
        const region = this.getRegionWithIp(dto.ip)

        await this.prisma.userSession.create({
            data:{
                userId: dto.userId,
                refreshToken: refreshHash,
                userAgent: dto.userAgente,
                ipAddress: dto.ip,
                country: region,
                expiresAt: dto.expireAt
            }
        });
        return {accessToken , refreshToken}
    }
    private getRegionWithIp(ip?: string): string | null {
        if (!ip) return null;

        const value = ip.trim().split(',')[0].trim();
        const ipStandardized = value.startsWith('::ffff:') ? value.replace('::ffff:', '') : value;

        if (!ip || ipStandardized === '::1' || ipStandardized === '127.0.0.1' || ipStandardized === 'localhost') {
            return null;
        }

        if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ipStandardized)) {
        return null;
        }

        const geo = geoip.lookup(ipStandardized);
        if (!geo?.city || !geo?.country) {
        return null;
        }

        return `${geo.city}, ${geo.country}`;
    }
    async singUp (dto: CreateUserPendingDto){
        const existUser = await this.usersService.findByEmail(dto.email)
        if(existUser)throw new ConflictException('The credentials already exist.')
        const randomCode: string = randomInt(100000, 1000000).toString()
        const expireAt = new Date()
        expireAt.setMinutes(expireAt.getMinutes() + 15)

        const passwordHash = await bcrypt.hash(dto.password , 10)

        const pedingData = {
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            code: randomCode
        }
        const ttlSeconds = 15 * 60;
        await this.redis.set(
            `pending-user:${dto.email}`,
            JSON.stringify(pedingData),
            'EX',
            ttlSeconds
        )
        await this.resendService.sendEmailVerify(dto.email,dto.code)
        return {message: "code sent" , email: dto.email}
        
    }
    async verifyEmail(){}
}