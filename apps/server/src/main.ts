// Load .env before any other imports
import { config } from 'dotenv';
import { join } from 'path';

const isBuilt = __dirname.includes('dist');
const envPath = isBuilt
  ? join(__dirname, '..', '.env') // apps/server/dist -> apps/server/.env
  : join(__dirname, '..', '.env'); // apps/server/src -> apps/server/.env

config({ path: envPath });

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.enableCors({
    origin: [
      'http://localhost:3020',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const port = 8080;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
