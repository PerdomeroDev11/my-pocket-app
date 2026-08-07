import { IsEmail, IsString,IsDate ,MinLength, IsNotEmpty, Length, IsInt} from 'class-validator'
import { Transform } from 'class-transformer'
import { NormalizedEmail } from '@/common/decorator/normalized-email.decorator'
import { RulesPassword } from '@/common/decorator/rules-password.decorator'

export class GenerateTokenDto{
    @IsString()
    userId!: string
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    sessionId!: string
}

export class LoginDto{
    @IsString()
    userId!: string
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    userAgente?: string
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
    @MinLength(7)
    code!: string
    @IsString()
    password!: string
    @IsDate()
    expireAt!: Date
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




