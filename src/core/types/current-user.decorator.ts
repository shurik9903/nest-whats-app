import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);

const getCurrentUserByContext = (context: ExecutionContext) =>
  context.switchToHttp().getRequest().user;
