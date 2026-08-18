import { Injectable , Inject ,UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Request } from 'express';
import { TokenBlackListService } from '@/redis/token-blackList.service';


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy (Strategy, 'jwt-refresh'){
    constructor(
        private readonly configService: ConfigService,
        private readonly tokenBlackList: TokenBlackListService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ){
        const secret =  configService.get('jwt.secretRefresh');
        if (!secret) throw new Error('JWT_REFRESH_SECRET it is not defined')
        super({
            jwtFromRequest: (req: Request) => req?.cookies?.refresh_token || null,
            ignoreExpiration: false,
            secretOrKey:secret,
            passReqToCallback: true,
        })
    }
    async validate(req: Request, payload: { sub: string , email:string , sessionId: string , jti: string }) {
        const refreshToken = req.cookies?.refresh_token;
        const isBlackListed = await this.tokenBlackList.isBlackListByJti(payload.jti)
        if (isBlackListed) throw new UnauthorizedException ('revoked token')
        const sessionActive = await this.redis.get(`session:${payload.sessionId}`)
        if(sessionActive != 'ON') throw new UnauthorizedException('session revoked')
        return { id: payload.sub, refreshToken };
  }
}