import { IsBoolean, IsDate, IsDateString, IsDecimal, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { TypeMovement } from '@generated/prisma/enums'

export class CreateMovementsDto{
    @IsString()
    desciption?: string
    @IsNumber({maxDecimalPlaces: 2})
    @IsOptional()
    @IsPositive()
    amount!: number
    @IsNumber({maxDecimalPlaces: 2})
    @IsOptional()
    @IsPositive()
    expectAmount?: number
    @IsDateString()
    date!: Date
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