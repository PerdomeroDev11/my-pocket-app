import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import  {ConfigModule, ConfigService} from '@nestjs/config'
import { TokenBlackListService } from "@/redis/token-blackList.service";
import { ResendModule } from "@/resend/resend.module";
import { PrismaModule } from "@/prisma-config/prisma.module";
import { RedisModule } from "@/redis/redis.module";
import { AuthGoogleService } from "./ google-auth.service";


@Module({
    imports: [
        ResendModule,
        ConfigModule,
        PassportModule,
        PrismaModule,
        RedisModule,
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports:[ ConfigModule],
            inject: [ConfigService],
            useFactory: async(configService:ConfigService)=>({
                secret: configService.get<string>('jwt.accesToken'),
                signOptions:{
                    expiresIn: configService.get('jwt.expireIn')
                }
            })
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenBlackListService,
        JwtStrategy,
        JwtRefreshStrategy,
        AuthGoogleService
    ],
    exports:[AuthService, JwtModule]
})
export class AuthModule{}