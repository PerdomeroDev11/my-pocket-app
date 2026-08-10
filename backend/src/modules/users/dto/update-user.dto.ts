import { RulesPassword } from '@/common/decorator/rules-password.decorator'
import { IsNotEmpty, IsString } from 'class-validator'
import { string } from 'joi'

export class ChangePasswordDto{
    @RulesPassword()
    @IsNotEmpty()
    password!: string
    @RulesPassword()
    @IsNotEmpty()
    passwordNew!: string
    @RulesPassword()
    @IsNotEmpty()
    confirmPassword!: string
}

export class UpdateUserdto {
    name?: string
    timeZone?: string
    lenguaje?: string
    profilePicture?: string
}