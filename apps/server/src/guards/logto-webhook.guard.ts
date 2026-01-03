import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

export function LogtoWebHookGuard(envkey: string) {
  @Injectable()
  class LogtoWebHookGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      if (!envkey) {
        throw new Error('Logto Webhook key is not provided');
      }
      const envKeyValue = process.env[envkey];
      if (!envKeyValue) {
        throw new Error(`Environment variable ${envkey} is not set`);
      }

      const req = context.switchToHttp().getRequest<Request>();
      const rawBody = req.body as unknown as Record<string, any>;
      if (!rawBody) throw new Error('Raw body is not available in the request');

      const expectedSignature = req.headers['logto-signature-sha-256'];
      if (!expectedSignature) {
        throw new Error(
          'Expected signature is not available in the request headers',
        );
      }

      const hmac = crypto.createHmac('sha256', envKeyValue);
      hmac.update(JSON.stringify(rawBody));
      const signature = hmac.digest('hex');
      return signature === expectedSignature;
    }
  }
  return mixin(LogtoWebHookGuard);
}
