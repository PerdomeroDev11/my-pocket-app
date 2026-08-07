import { Exclude } from 'class-transformer';
import { 
    UserSession,
    statusSession
} from '@generated/prisma/client';


export class UserSessionsEntity implements Omit<UserSession, 'refreshToken' | 'userId' | 'expireAt'>{
    id!: string
    userAgent!: string | null;
    ipAddress!: string | null;
    country!: string | null;
    status!: statusSession;
    createdAt!: Date;
    updatedAt!: Date;

    @Exclude()
    refreshToken!: string;
    userId!: string;
    expiresAt!: Date;

    constructor(partial: Partial<UserSession>){
        Object.assign(this , partial)
    }
}

