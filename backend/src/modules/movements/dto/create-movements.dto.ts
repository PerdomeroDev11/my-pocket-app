import { IsBoolean, IsDate, IsDateString, IsDecimal, IsEnum, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { TypeMovement } from '@generated/prisma/enums'

export class CreateMovementsDto{
    @IsString()
    desciption?: string
    @IsDecimal()
    @IsOptional()
    @IsPositive()
    amount!: number
    @IsDecimal()
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