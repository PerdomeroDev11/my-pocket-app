
import { Exclude } from 'class-transformer';
import { 
    User ,
    statusUser,
    UserPendingEmail,
    UserSession
} from '@generated/prisma/client';

export class UserEntity implements Omit<User, 'password' | 'passwordUpdate' | 'googleId'> {
  id!: string;
  name!: string ;
  email!: string;
  verifyEmail!: boolean ;
  timeZone!: string | null;
  status!: statusUser;
  language!: string | null;
  createdAt!: Date;
  updatedAt!: Date ;
  payPeriod!: string;

  @Exclude()
  password?: string ;
  passwordUpdate?: string;
  googleId?: string


  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

}




