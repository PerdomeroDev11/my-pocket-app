import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator'
import { TypeMovement } from '@generated/prisma/enums'
import { NormalizedNumber } from '@/common/decorator/normalized-amount.decorator';

export class CreateMovementsDto{
    @IsString()
    name!: string

    @IsString()
    @IsOptional()
    description?: string

    @NormalizedNumber()
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
    institutionFinancialId!: string | null
}