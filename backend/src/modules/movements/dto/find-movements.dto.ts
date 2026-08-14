import { IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { TypeMovement } from '@generated/prisma/enums'

export class FindMovementsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(TypeMovement)
  typeMovement?: TypeMovement;
}