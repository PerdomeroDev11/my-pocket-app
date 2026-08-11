import { IsDecimal, IsEnum, IsString } from 'class-validator'
import { typeIntitution } from '@generated/prisma/enums'

export class CreateFinancialInstitutionDto {
    @IsString()
    name!: string
    @IsEnum(typeIntitution)
    @IsString()
    type?: typeIntitution
    @IsDecimal()
    balanceNow!: string
}