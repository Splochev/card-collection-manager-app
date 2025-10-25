/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const config = new DocumentBuilder()
    .setTitle('Card Collection Manager API')
    .setDescription('API for managing card collections')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'access-token',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 8080;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`
  );
}

bootstrap();
