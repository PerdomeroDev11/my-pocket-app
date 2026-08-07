import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {JwtService} from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt'
import { PrismaService } from "@/prisma-config/prisma.service";
import { UsersService } from "../users/users.service";
import { randomInt , randomUUID } from "crypto";
import { CreateUserPendingDto, GenerateTokenDto ,LoginDto, PayloadLogOutDto, SingInDto, VerifyEmailDto} from "./dto/jwt.dto";
import geoip from 'geoip-lite';
import { ResendService } from "@/resend/resend.service";
import Redis from "ioredis";
import { TokenBlackListService } from "@/redis/token-blackList.service";
import { count } from "console";


@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private resendService: ResendService,
        private tokenBlackList: TokenBlackListService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){}
    private async generateTokens (dto: GenerateTokenDto):Promise<{accessToken:string , refreshToken:string}>{
        const accessToken = this.jwtService.sign(
            {
                sub: dto.userId,
                email: dto.email,
                sesionId: dto.sessionId,
                jti: randomUUID(),
            },
            {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn')
            }
        );
        const refreshToken = this.jwtService.sign(
            {sub: dto.userId , sessionId: dto.sessionId},
            {
                secret: this.configService.get('jwt.secretRefresh'),
                expiresIn: this.configService.get('jwt.expiresInRefresh')
            }
        );
        return {accessToken , refreshToken}
    }
    async session (dto: LoginDto): Promise<{accessToken:string , refreshToken: string}>{


        
        const region = this.getRegionWithIp(dto.ip)
        const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const session = await this.prisma.userSession.create({
            data:{
                userId: dto.userId,
                refreshToken: '',
                userAgent: dto.userAgente,
                country: region,
                expiresAt: expireAt
            }
        });
        const {accessToken, refreshToken} = await this.generateTokens({
            userId: dto.userId ,
            email: dto.email,
            sessionId: session.id
            });

        const refreshHash = await bcrypt.hash(refreshToken , 10);
        await this.prisma.userSession.update({
            where:{id: session.id},
            data:{refreshToken: refreshHash}
        })
        const ttlSeconds = 7 * 24 * 60 * 60; // 7 días
        await this.redis.set(`session:${session.id}`, 'ON' , 'EX' , ttlSeconds )
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
        const email = dto.email.trim().toLowerCase()
        console.log(email)
        const existUser = await this.usersService.findByEmail(email)
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
        await this.resendService.sendEmailVerify(dto.email,randomCode)
        return {message: "code sent" , email: dto.email}
        
    }
    async verifyEmail(dto: VerifyEmailDto , userAgente: string , ip:string){
        const email = dto.email.trim().toLowerCase()
        console.log(email)
        const raw = await this.redis.get(`pending-user:${dto.email}`)
        console.log(raw)
        if(!raw) throw new BadRequestException('the code not exit or expire')
        
        const pedingData: {name: string , email:string , password: string , code:string , expireAt: Date}  = JSON.parse(raw)

        if(pedingData.code != dto.code) throw new BadRequestException('code incorrect')

        const user = await this.usersService.createUser(pedingData)

        await  this.redis.del(`pending-user:${dto.email}`)
        
        return await this.session({userId: user.id ,email: user.email, userAgente:userAgente ,ip:ip} )
    }
    async singIn(dto: SingInDto , userAgent: string , ip:string ){
        const user = await this.usersService.findByEmailOThrow(dto.email);
        if(!user) throw new UnauthorizedException('user not found for sing in')
        if(!user.password) throw new UnauthorizedException('password not found')
        
        const isPasswordValid = await bcrypt.compare(dto.password , user.password)

        if(!isPasswordValid) throw new UnauthorizedException('invalid credentials')
        
        return await this.session({
            userId: user.id,
            email: user.email,
            userAgente: userAgent,
            ip: ip
        })
    }
    async logOut (dto: PayloadLogOutDto){
        await this.prisma.userSession.update({
            where:{id: dto.sessionId },
            data:{status: "OFF"}
        })

        await this.redis.set(`session:${dto.sessionId}`, 'OFF' , 'KEEPTTL')

        await this.tokenBlackList.blackListByJti(dto.jti , dto.exp)

        return {message: 'logged out successfully'}
    }
    async logoutAll (userId: string){
        const sessions = await this.prisma.userSession.findMany({
            where:{userId , status: "ON"}
        });

        await this.prisma.userSession.updateMany({
            where:{userId , status: "ON"},
            data:{ status: "OFF"}
        })

        await Promise.all(
            sessions.map((s) => this.redis.set(`session:${s.id}`, 'OFF' ,'KEEPTTL'))
        )
        return {message: 'all session logged out', count: sessions.length}
    }
    async closeSessionRemote(sessionId : string , requestingUserId: string , password:string){
        const user = await this.usersService.findbyId(requestingUserId)
        if(!user) throw new BadRequestException('user no found')
        if(!user.password) throw new  BadRequestException('password not exist')
        const isValidPassword = bcrypt.compare(password,user.password)
        if(!isValidPassword) throw new UnauthorizedException('incorrect credentials')
        const session = await this.prisma.userSession.findUnique({where:{id: sessionId}})

        if(!session || session.userId !== requestingUserId) throw new ForbiddenException('you can not close this sesision')
        
        await this.prisma.userSession.update({
            where:{id: sessionId},
            data:{status: 'OFF'}
        })
        return {message: 'session closed'}

    }
}