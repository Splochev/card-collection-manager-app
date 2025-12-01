import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express-serve-static-core';
import * as jsonwebtoken from 'jsonwebtoken';
import { JwtHeader } from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { configDotenv } from 'dotenv';
import * as path from 'path';

declare module 'express-serve-static-core' {
  interface Request {
    userAuthId?: string;
  }
}

const envPath = path.resolve(__dirname, '../../../../.env');
configDotenv({ path: envPath });

if (!process.env.LOGTO_AUDIENCE) {
  throw new Error('LOGTO_AUDIENCE environment variable is not set');
}

if (!process.env.LOGTO_BASE_URL) {
  throw new Error('LOGTO_BASE_URL environment variable is not set');
}

function extractBearerTokenFromHeaders(
  headers: Record<string, unknown>,
): string | undefined {
  const authHeader =
    headers['authorization'] ||
    (headers['Authorization'] as string | undefined);

  if (
    !authHeader ||
    typeof authHeader !== 'string' ||
    !authHeader.startsWith('Bearer ')
  ) {
    return undefined;
  }
  return authHeader.slice('Bearer '.length);
}

const client = new jwksRsa.JwksClient({
  jwksUri: process.env.LOGTO_BASE_URL + '/oidc/jwks' || '',
});

const getKey = (
  header: JwtHeader,
  callback: (err: Error | null, key?: string | Buffer) => void,
): void => {
  if (!header.kid) {
    return callback(new Error('Missing kid in token header'));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err);
      return callback(err);
    }

    if (!key) {
      return callback(new Error('No signing key found'));
    }

    try {
      let signingKey: string | Buffer;

      if ('getPublicKey' in key && typeof key.getPublicKey === 'function') {
        signingKey = key.getPublicKey();
      } else if ('publicKey' in key && key.publicKey) {
        signingKey = key.publicKey;
      } else if ('rsaPublicKey' in key && key.rsaPublicKey) {
        signingKey = key.rsaPublicKey;
      } else {
        return callback(
          new Error('No public key available in the signing key'),
        );
      }

      if (!signingKey) {
        return callback(new Error('Could not extract public key'));
      }

      callback(null, signingKey);
    } catch (error) {
      console.error('Error extracting public key:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error);
      callback(new Error(`Failed to get public key: ${errorMessage}`));
    }
  });
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractBearerTokenFromHeaders(req.headers);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      return new Promise<boolean>((resolve, reject) => {
        jsonwebtoken.verify(
          token,
          (
            header: jsonwebtoken.JwtHeader,
            callback: (err: Error | null, key?: string | Buffer) => void,
          ) => {
            getKey(header, callback);
          },
          {
            issuer: process.env.LOGTO_BASE_URL + '/oidc',
            audience: process.env.LOGTO_AUDIENCE,
            algorithms: ['ES384'] as jsonwebtoken.Algorithm[],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err: jsonwebtoken.VerifyErrors | null, payload: any) => {
            if (err) {
              console.error('JWT verification error:', err);
              if (
                err.name === 'TokenExpiredError' ||
                err.name === 'JsonWebTokenError' ||
                err.name === 'NotBeforeError'
              ) {
                return reject(
                  new UnauthorizedException('Token expired or invalid claims'),
                );
              }
              return reject(
                new ForbiddenException(
                  'Token verification failed: ' + err.message,
                ),
              );
            }

            if (!payload || typeof payload !== 'object') {
              return reject(new UnauthorizedException('Invalid token payload'));
            }

            const sub = payload.sub as string | undefined;

            if (!sub || typeof sub !== 'string') {
              return reject(
                new UnauthorizedException('Missing or invalid subject claim'),
              );
            }

            req.userAuthId = sub;
            resolve(true);
          },
        );
      });
    } catch (error) {
      console.error('Error in JWT guard:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
