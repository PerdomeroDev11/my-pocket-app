
import { Exclude } from 'class-transformer';
import { 
    User ,
    statusUser,
    typePeriod
} from '@generated/prisma/client';

export class UserResponseEntity implements Omit<User, 'password' |  'googleId'  | 'id'> {
  name!: string ;
  email!: string;
  verifyEmail!: boolean ;
  profilePicture!: string | null;
  timeZone!: string | null;
  status!: statusUser ;
  language!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  country!: string | null;
  currency!: string | null;
  typePeriod!: typePeriod | null;
  withGoogle!: boolean;

  @Exclude()
  password?: string ;
  googleId?: string
  id?: string


  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}





