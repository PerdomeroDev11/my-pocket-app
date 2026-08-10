
import { Exclude } from 'class-transformer';
import { 
    User ,
    statusUser,
    UserSession,
    statusSession
} from '@generated/prisma/client';

export class UserResponseEntity implements Omit<User, 'password' |  'googleId'  | 'id'> {
  name!: string ;
  email!: string;
  verifyEmail!: boolean ;
  profilePicture!: string | null;
  timeZone!: string | null;
  status!: statusUser ;
  language!: string | null
  ;
  createdAt!: Date;
  updatedAt!: Date  ;

  @Exclude()
  password?: string ;
  googleId?: string
  id?: string


  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

export class UserSessionResponseEntity implements Omit< UserSession, 'id' | 'userId' | 'refreshToken' | 'craateAt'>{
  status!: statusSession | null;
  country!: string | null;
  ipAddress!: string | null;
  updatedAt!: Date;
  userAgent!: string | null;
  expiresAt!: Date;

  @Exclude()
  id!: string
  userId!:string
  refreshToken!: string
  createdAt!: Date;

  constructor(partial: Partial<UserSession>){
    Object.assign(this , partial)
  }
}




