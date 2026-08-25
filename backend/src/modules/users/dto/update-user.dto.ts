import { RulesPassword } from '@/common/decorator/rules-password.decorator'
import { typePeriod } from '@generated/prisma/enums'
import { IsEnum, IsNotEmpty, IsOptional, isString, IsString } from 'class-validator'
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
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    timeZone?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsEnum(typePeriod)
    typePeriod?: typePeriod;
}