import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SuperAdminPasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const password = request.headers['password'];
    if (password !== process.env.SUPER_ADMIN_PASSWORD) {
      throw new ForbiddenException('Invalid password');
    }
    return true;
  }
}
