import { Exclude } from 'class-transformer';
import { 
    UserSession,
    statusSession
} from '@generated/prisma/client';
import { UserResponseEntity } from '@/modules/users/entity/user.entity';


export class UserSessionsEntity implements Omit<UserSession, 'refreshToken' | 'userId' | 'expireAt' | 'jti'>{
    id!: string
    userAgent!: string | null;
    ipAddress!: string | null;
    country!: string | null;
    status!: statusSession;
    createdAt!: Date;
    updatedAt!: Date;
    isCurrent!: boolean | null;
    @Exclude()
    refreshToken!: string;
    userId!: string;
    expiresAt!: Date;
    jti!: string

    constructor(partial: Partial<UserSession>){
        Object.assign(this , partial)
    }
}
export interface AuthResponseInterface{
    accessToken: string;
    refreshToken: string;
    user: UserResponseEntity; 
}


