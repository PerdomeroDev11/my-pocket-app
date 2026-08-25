import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadValidateDto } from '@/modules/auth/dto/jwt.dto';

export const CurrentUser = createParamDecorator(
  (data: keyof PayloadValidateDto | undefined, ctx: ExecutionContext)=> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as PayloadValidateDto;

    return data ? user?.[data]: user;
  },
);