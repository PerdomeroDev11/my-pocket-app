import { IsEmail, IsString,IsDate ,MinLength} from 'class-validator'

export class GenerateTokenDto{
    @IsString()
    userId!: string
    @IsString()
    @IsEmail()
    email!: string
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
    @IsString()
    region?: string
    @IsDate()
    expireAt!: Date
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
    @MinLength(7)
    password!: string
    @IsDate()
    expireAt!: Date
}



