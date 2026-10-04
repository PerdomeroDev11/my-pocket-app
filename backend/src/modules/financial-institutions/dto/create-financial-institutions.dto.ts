import { Transform ,Type} from 'class-transformer'
import { IsEnum, IsNumber, IsString, Min } from 'class-validator'
import { typeIntitution } from '@generated/prisma/enums'

export class CreateFinancialInstitutionDto {
    @IsString()
    name!: string
    @IsEnum(typeIntitution)
    @IsString()
    type?: typeIntitution
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Transform(({ value }) => value === '' || value === undefined || value === null ? undefined : Number(value))
    balanceNow!: string
}