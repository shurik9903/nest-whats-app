import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/database/mongodb/schemas/User.schema';

export const CurrentUser = createParamDecorator(
  (_data: string, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);

const getCurrentUserByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest<{ user: User }>().user;
};
