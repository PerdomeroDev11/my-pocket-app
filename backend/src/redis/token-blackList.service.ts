import { Injectable, Inject } from "@nestjs/common";
import Redis from 'ioredis'

@Injectable()
export class TokenBlackListService {
    constructor (@Inject('REDIS_CLIENT')private readonly redis:Redis){}

    async blackListByJti(jti: string , exp: number): Promise<void>{
        const ttlSeconds = exp - Math.floor(Date.now() / 1000);
        if (ttlSeconds <= 0 ) return

        await this.redis.set(`bl:${jti}` ,'1', 'EX', ttlSeconds);
    }

    async isBlackListByJti(jti: string): Promise<boolean>{
        const exist = await this.redis.exists(`bl:${jti}`)
        return exist === 1;
    }
}