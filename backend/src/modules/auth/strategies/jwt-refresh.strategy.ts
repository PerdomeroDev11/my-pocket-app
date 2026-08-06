import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy (Strategy, 'jwt-refresh'){
    constructor(
        private configService: ConfigService,
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
    async validate(req: Request, payload: { sub: string }) {
        const refreshToken = req.cookies?.refresh_token;
        return { id: payload.sub, refreshToken };
  }
}