import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {PassportStrategy} from '@nestjs/passport'
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { TokenBlackListService } from "@/redis/token-blackList.service";
import Redis from "ioredis";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(
        private readonly configService: ConfigService,
        private readonly tokenBlackList: TokenBlackListService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){
        const secret = configService.get<string>('jwt.secret');
        if(!secret) throw new Error('JWT_ACCESS_SECRET it is not defined')
        super({
            jwtFromRequest:(req: Request) => {
                const accessToken = req?.cookies?.access_token || req?.cookies?.acces_token || null
                return accessToken
            },
            ignoreExpiration: false,
            secretOrKey: secret,
        })
    }
    async validate (payload: {sub:string, email:string , sessionId: string , jti: string}){
        const isBlackListed = await this.tokenBlackList.isBlackListByJti(payload.jti)
        if (isBlackListed) throw new UnauthorizedException ('revoked token')
        const sessionActive = await this.redis.get(`session:${payload.sessionId}`)
        if(sessionActive != 'ON') throw new UnauthorizedException('session revoked')
        return payload
    }
}