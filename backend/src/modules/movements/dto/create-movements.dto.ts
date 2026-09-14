import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { TypeMovement } from '@generated/prisma/enums'

export class CreateMovementsDto{
    @IsString()
    name!: string

    @IsString()
    @IsOptional()
    description?: string

    @IsNumber({maxDecimalPlaces: 2})
    @IsOptional()
    @IsPositive()
    amount!: number

    @IsDateString()
    date!: string

    @IsBoolean()
    isPay!: boolean

    @IsString()
    @IsEnum(TypeMovement)
    typeMovement!: TypeMovement

    @IsUUID()
    @IsString()
    @IsOptional()
    institutionFinancialId?: string
}