import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';

export function RulesPassword() {
  return applyDecorators(
    IsString(),
    MinLength(8, {message: 'the password must be at least 8 characters long'})
  );
}