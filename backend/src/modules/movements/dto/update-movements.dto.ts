import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsBoolean,  IsEnum, IsNotEmpty, IsOptional , IsUUID,IsString} from "class-validator";
import { CreateMovementsDto } from "./create-movements.dto";
import {  TypeMovement } from "@generated/prisma/enums";

export class UpdateMovementsDto extends PartialType(CreateMovementsDto){
    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
    @IsBoolean()
    @IsNotEmpty()
    isPay!: boolean
    @IsUUID()
    @IsString()
    @IsOptional()
    institutionFinancialId!: string | null
}
export class DeleteMovementDto {
    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
    @IsBoolean()
    @IsNotEmpty()
    isPay!: boolean
    @IsEnum(TypeMovement)
    typeMovement!: TypeMovement
}