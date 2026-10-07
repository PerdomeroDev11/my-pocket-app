import { applyDecorators } from '@nestjs/common';
import { Transform,Type} from 'class-transformer';
import { Min,IsNumber } from 'class-validator';

export function NormalizedNumber() {
  return applyDecorators(
        Type(() => Number),
        IsNumber({maxDecimalPlaces: 2}),
        Transform(({ value }) => value === '' || value === undefined || value === null ? undefined : Number(value)),
        Min(0)
  );
}