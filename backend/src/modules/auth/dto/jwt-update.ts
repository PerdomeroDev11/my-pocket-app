import { IsNotEmpty, IsString } from 'class-validator'
import { NormalizedEmail } from '@/common/decorator/normalized-email.decorator'
import { RulesPassword } from '@/common/decorator/rules-password.decorator'

export class ForgotPasswordDto {
    @NormalizedEmail()
    @IsNotEmpty()
    email!: string
    @IsString()
    @IsNotEmpty()
    code!: string
    @RulesPassword()
    @IsNotEmpty()
    passwordNew!: string 
}

