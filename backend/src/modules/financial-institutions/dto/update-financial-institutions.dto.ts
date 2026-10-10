import { Transform ,Type} from 'class-transformer'
import { IsEnum, IsNumber, IsString, Min } from 'class-validator'
import { typeIntitution } from '@generated/prisma/enums'
import { NormalizedNumber } from '@/common/decorator/normalized-amount.decorator'

export class UpdateFinancialInstitutionsDto {
    @IsString()
    name?: string
    @IsEnum(typeIntitution)
    @IsString()
    type!: typeIntitution
    @IsString()
    status!: 'ACTIVE' | 'DESACTIVE'
}