import { IsDate, IsEmail, IsEnum, isString, IsString, MinLength} from 'class-validator'

export class CreateUserDto{
    @IsString()
    name!: string
    @IsString()
    @IsEmail()
    email!: string
    @IsString()
    @MinLength(7)
    password!: string 
}

