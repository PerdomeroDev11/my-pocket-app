import { Module } from "@nestjs/common";
import { TokenBlackListService } from "./token-blackList.service";
import { ConfigModule , ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
                inject:[ConfigService],
                useFactory: (configService: ConfigService) =>{
                    return new Redis({
                        host: configService.get<string>('redis.host'),
                        port: configService.get<number>('redis.port'),
                        password: configService.get<string>('redis.password'),
                    })
                }
        },
        TokenBlackListService
        
    ],
    exports:['REDIS_CLIENT' , TokenBlackListService]

    
})

export class RedisModule {}