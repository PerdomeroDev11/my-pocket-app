import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export function NormalizedEmail() {
  return applyDecorators(
    Transform(({ value }) => value?.trim().toLowerCase()),
    IsEmail({},{message: 'must be a valid email'}),
    IsString(),
  );
}