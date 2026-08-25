import {IsString,IsDate ,MinLength, IsNotEmpty, Length, IsInt, IsEnum, IsOptional} from 'class-validator'
import { NormalizedEmail } from '@/common/decorator/normalized-email.decorator'
import { RulesPassword } from '@/common/decorator/rules-password.decorator'
import { typePeriod } from '@generated/prisma/enums'

export class GenerateTokenDto{
    @IsString()
    sub!: string
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    sessionId!: string
    @IsString()
    jti!: string
}

export class LoginDto{
    @IsString()
    userId!: string
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    userAgent?: string
    @IsString()
    ip?: string
}
export class SingInDto {
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @RulesPassword()
    @IsNotEmpty()
    password!: string
}
export class VerifyEmailDto{
    @NormalizedEmail()
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
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    password!: string
    @IsOptional()
    @IsString()
    timeZone?: string
    @IsOptional()
    @IsString()
    language?: string
    @IsOptional()
    @IsString()
    country?: string
    @IsString()
    currency!: string
    @IsEnum(typePeriod)
    typePeriod!: typePeriod
}

export class PayloadValidateDto{
    @IsString()
    sub!:string
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    sessionId!: string
    @IsString()
    jti!: string
    @IsInt()
    exp!: number
}

export class PayloadLogOutDto {
    @IsString()
    sub!: string
    @IsString()
    sessionId!: string
    @IsString()
    jti!: string
    @IsInt()
    exp!: number
}
export class SentEmailDto{
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
}




