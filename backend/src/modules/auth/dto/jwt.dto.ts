import { IsEmail, IsString,IsDate ,MinLength, IsNotEmpty, Length} from 'class-validator'

export class GenerateTokenDto{
    @IsString()
    userId!: string
    @IsString()
    @IsEmail()
    email!: string
    @IsString()
    sessionId!: string
}

export class LoginDto{
    @IsString()
    userId!: string
    @IsString()
    @IsString()
    @IsEmail()
    email!: string
    userAgente?: string
    @IsString()
    ip?: string
}
export class SingInDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    @IsNotEmpty()
    password!: string
}
export class VerifyEmailDto{
    @IsString()
    @IsEmail({},{message: 'invalid email format '})
    @IsNotEmpty()
    email!: string
    @IsString()
    @IsNotEmpty()
    @Length(6,6,{message: 'the code must be to 6 digits long'})
    code!: string
}

export class CreateUserSessionDto {
    @IsString()
    userId!: string
    @IsString()
    refreshToken!: string
    @IsString()
    userAgent?: string
    @IsString()
    ip?: string
    @IsString()
    county?: string
    @IsDate()
    expireAt!: Date
}

export class CreateUserPendingDto {
    @IsString()
    name!: string
    @IsEmail()
    @IsString()
    email!: string
    @IsString()
    @MinLength(7)
    code!: string
    @IsString()
    password!: string
    @IsDate()
    expireAt!: Date
}

export class LogOutDto {
    @IsString()
    @IsNotEmpty()
    userId!: string
    @IsString()
    @IsNotEmpty()
    sessionId!: string
}


