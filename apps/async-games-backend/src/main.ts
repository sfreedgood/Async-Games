/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Security headers (CSP, HSTS, X-Frame-Options, etc.).
  app.use(helmet());

  // Restrict cross-origin access to the known frontend origin(s) instead of
  // the permissive default. Override via CORS_ORIGINS (comma-separated).
  const corsOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:4200'
  ).split(',');
  app.enableCors({ origin: corsOrigins });

  // Enforce class-validator DTOs at the request boundary (the documented
  // "two-layer validation" Layer 1). whitelist strips unknown properties;
  // forbidNonWhitelisted rejects them (→400); transform coerces payloads
  // into the DTO classes so decorators like @IsInt actually run.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;

  // Only expose the Swagger UI / OpenAPI document outside production so the
  // full API surface is not published on a live deployment.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setVersion('1.0')
      .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
