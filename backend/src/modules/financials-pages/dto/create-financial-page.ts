import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateFinancialPageDto {
    @IsString()
    name!: string
}