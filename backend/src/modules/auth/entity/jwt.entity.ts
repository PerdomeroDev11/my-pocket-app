import { Exclude } from 'class-transformer';
import { 
    UserSession,
    UserPendingEmail,
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

export class UserPendingEntity implements Omit<UserPendingEmail , 'code' | 'password'>{
    id!: string;
    name!: string;
    email!: string;
    expiresAt!: Date;
    createdAt!: Date;
    
    @Exclude()
    password!: string;
    code!: string

    constructor(partial: Partial<UserPendingEmail>){
        Object.assign(this , partial)
    }
}