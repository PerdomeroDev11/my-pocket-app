import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { TypeMovement } from '@generated/prisma/enums'

export class CreateMovementsDto{
    @IsString()
    name!: string

    @IsString()
    @IsOptional()
    description?: string

    @Type(() => Number)
    @IsNumber({maxDecimalPlaces: 2})
    @IsOptional()
    @IsPositive()
    @Transform(({ value }) => value === '' || value === undefined || value === null ? undefined : Number(value))
    amount!: number

    @IsDateString()
    date!: string

    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
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