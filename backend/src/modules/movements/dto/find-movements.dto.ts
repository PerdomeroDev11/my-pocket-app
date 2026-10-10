import { IsOptional,  IsUUID, IsEnum } from 'class-validator';
import { TypeMovement } from '@generated/prisma/enums'

export class FindMovementsQueryDto {

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(TypeMovement)
  typeMovement!: TypeMovement;
}