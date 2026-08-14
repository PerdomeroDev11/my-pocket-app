import { PartialType } from "@nestjs/mapped-types";
import { CreateMovementsDto } from "./create-movements.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateMovementsDto extends PartialType(CreateMovementsDto){
    @IsOptional()
    @IsBoolean()
    isPay?: boolean
}