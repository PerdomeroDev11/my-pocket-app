import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsBoolean, IsDecimal, IsEnum, IsOptional } from "class-validator";
import { CreateMovementsDto } from "./create-movements.dto";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { typeInvestment, TypeMovement } from "@generated/prisma/enums";

export class UpdateMovementsDto extends PartialType(CreateMovementsDto){
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
    @IsBoolean()
    isPay?: boolean
}
export class DeleteMovementDto {
    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
    @IsBoolean()
    isPay!: boolean
    @IsEnum(TypeMovement)
    typeMovement!: TypeMovement
}