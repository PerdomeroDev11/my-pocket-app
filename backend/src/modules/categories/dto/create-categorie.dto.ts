import { IsBoolean, IsDecimal, IsString } from 'class-validator'

export class CreateCategoryDto{
    @IsString()
    name!: string
    @IsBoolean()
    isRecurrent?: boolean
    @IsBoolean()
    IsPermanent!: boolean
}