import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {JwtService} from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt'
import { PrismaService } from "@/prisma-config/prisma.service";
import { randomInt , randomUUID } from "crypto";
import { 
    CreateUserPendingDto,
    GenerateTokenDto ,
    LoginDto, 
    PayloadLogOutDto,
    SingInDto,
    VerifyEmailDto,
    SentEmailDto
    } from "./dto/jwt.dto";
import geoip from 'geoip-lite';
import { ResendService } from "@/resend/resend.service";
import Redis from "ioredis";
import { TokenBlackListService } from "@/redis/token-blackList.service";
import { ForgotPasswordDto} from "./dto/jwt-update";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { AuthGoogleService } from "./ google-auth.service";
import { typePeriod } from "@generated/prisma/enums";
import { DEFAULT_BALANCE_SECTION } from "@/common/constants/balance-section";

@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private resendService: ResendService,
        private tokenBlackList: TokenBlackListService,
        private googleAuthService: AuthGoogleService,
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
                userAgent: dto.userAgent,
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
    private async sentCodeVerification(key:string,email:string , data: Record<string, any>){
        const coolDownKey = `${key}:${email}`
        const onCoolDown = await this.redis.get(coolDownKey)
        if(onCoolDown) throw new BadRequestException('Please wait before requesting a new code')
        const code: string = randomInt(100000, 1000000).toString()
        const ttlSecond = 15 * 60
        const cooldownSeconds = 60

        const fullData = {
            ...data,
            code
        }

        await this.redis.set(
            `${key}:${email}`, 
            JSON.stringify(fullData),
             'EX' , 
             ttlSecond
            )
        await this.redis.set(coolDownKey, JSON.stringify(fullData) , 'EX', cooldownSeconds)

        await this.resendService.sendEmailVerify(email, fullData.code)
        return fullData
    }
    async loginWithGoogle(dto: GoogleLoginDto, userAgent: string , ip:string){
        const googleData = await this.googleAuthService.verifyTokenGoogle(dto);

        let user= await this.prisma.user.findUnique({where:{email: googleData.email}});
        const ipAddress = await this.getRegionWithIp(ip)

        if(!user){
            const created = await this.prisma.user.create({
                data:{
                    name:googleData.name ?? "",
                    email: googleData.email,
                    googleId: googleData.googleId,
                    verifyEmail: true,
                    profilePicture: googleData.avatar,
                    language: (googleData as any).language || 'es',
                    country: ipAddress
                }
            });
            await this.prisma.balanceSection.createMany({
                    data: DEFAULT_BALANCE_SECTION.map((section) => ({
                        userId: created.id,
                        nameBalance: section.nameBalance
                    }))
                })
            user = created
            if(!created) throw new BadRequestException('there was an problem creating the user with Google')
        }else if (!user.googleId){
            await this.prisma.user.update({
                where:{id:user.id},
                data:{googleId: googleData.googleId}
            });
        }
        
        return await this.session({
            userId: user.id,
            email: user.email,
            userAgent: userAgent,
            ip: ip
        })
    }
    async singUp (dto: CreateUserPendingDto){
        
        const existUser = await this.prisma.user.findUnique({
            where:{
                email:dto.email
            },
            select:{
                email:true
            }
        })
        if(existUser)throw new ConflictException('The credentials already exist.')

        const passwordHash = await bcrypt.hash(dto.password , 10)

        const pedingData = {
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            timeZone: dto.timeZone,
            language: dto.language,
            country: dto.country,
            currency: dto.currency,
            typePeriod: dto.typePeriod
        }
        await this.sentCodeVerification('verifyEmail' , pedingData.email , pedingData)
        return {message: "code sent" , email: dto.email}
        
    }
    async verifyEmail(dto: VerifyEmailDto , userAgent: string , ip:string){
        const raw = await this.redis.get(`verifyEmail:${dto.email}`)
        console.log(raw)
        if(!raw) throw new BadRequestException('the code not exit or expire')
        
        const pedingData: {
            name: string , 
            email:string , 
            password: string , 
            code:string , 
            expireAt: Date , 
            timeZone:string , 
            language: string , 
            country:string , 
            currency: string,
            typePeriod: typePeriod
        }  = JSON.parse(raw)

        if(pedingData.code != dto.code) throw new BadRequestException('code incorrect')

        const user = await this.prisma.user.create({
            data:{
                name: pedingData.name,
                email: pedingData.email,
                password: pedingData.password,
                timeZone: pedingData.timeZone,
                language: pedingData.language,
                country: pedingData.country,
                currency: pedingData.currency,
                typePeriod: pedingData.typePeriod,
                verifyEmail: true
            }
        })
        await this.prisma.balanceSection.createMany({
                    data: DEFAULT_BALANCE_SECTION.map((section) => ({
                        userId: user.id,
                        nameBalance: section.nameBalance
                    }))
                })
        await  this.redis.del(`verifyEmail:${dto.email}`)
        
        return await this.session({userId: user.id ,email: user.email, userAgent:userAgent ,ip:ip} )
    }
    async singIn(dto: SingInDto , userAgent: string , ip:string ){
        const user = await this.prisma.user.findUniqueOrThrow({
            where:{email: dto.email}
        });
        if(!user) throw new UnauthorizedException('user not found for sing in')
        if(!user.password) throw new UnauthorizedException('password not found')
        
        const isPasswordValid = await bcrypt.compare(dto.password , user.password)

        if(!isPasswordValid) throw new UnauthorizedException('invalid credentials')
        
        return await this.session({
            userId: user.id,
            email: user.email,
            userAgent: userAgent,
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
        const user = await this.prisma.user.findUnique({
            where:{id: requestingUserId}
        })
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
    async sentEmailForgotPassword(dto: SentEmailDto){
        const  user= await this.prisma.user.findUnique({
            where:{email: dto.email , status: "ACTIVE"},
            select:{
                id: true,
                email:true
            }
        })

        if(!user) throw new BadRequestException('the email does not exist')
            
        
        await this.sentCodeVerification('forgotPassword' , user.email , {email:user.email})

        await this.logoutAll(user.id)

        return{ message: 'code sent' , email: user.email }
    }
    async resetPassword(dto: ForgotPasswordDto){
        const raw = await this.redis.get(`forgotPassword:${dto.email}`)

        if(!raw) throw new BadRequestException('email not found')
        if(!dto.passwordNew)throw new BadRequestException('there was an error to create new password')
        
        const rawReceived : {email:string , code:string} = JSON.parse(raw)

        if(dto.code !== rawReceived.code) throw new BadRequestException('incorrect code')
        const passwordNewHash = await bcrypt.hash(dto.passwordNew, 10)
        
        
        await this.prisma.user.update({
            where:{email: rawReceived.email, status: "ACTIVE" },
            data:{password: passwordNewHash}
        })

        await this.redis.del(`forgotPassword:${dto.email}`)

        const user = await this.prisma.user.findUnique({
            where:{email: rawReceived.email},
            select:{id:true}
        })
        if(user) await this.logoutAll(user.id)
        return {message: 'password reset successfully'}
    }
}