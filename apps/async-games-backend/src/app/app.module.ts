import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { ClassicCardModule } from './domains/classic-card';
import { UserModule } from './domains/user/module';

// Choose env file based on NODE_ENV: production uses .env, development uses
// .env.development with .env fallback.
const isProduction = process.env.NODE_ENV === 'production';
const envFilePath = isProduction ? '.env' : ['.env.development', '.env'];

// DB_SKIP=true runs the app without Postgres (e.g. test setups that don't touch
// persistence). When skipped, load neither the database config (which requires
// DB_* env vars and would throw) nor any module that depends on it. UserModule
// owns the only DatabaseModule import, so omitting both fully detaches the DB —
// gating them together here is the single source of truth for "DB enabled".
const databaseEnabled = process.env.DB_SKIP !== 'true';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath,
      load: databaseEnabled ? [databaseConfig] : [],
    }),
    // Global rate limiting: 60 requests per minute per client. Mitigates
    // brute-force and request-flood denial of service on unauthenticated routes.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ClassicCardModule,
    ...(databaseEnabled ? [DatabaseModule, UserModule] : []),
  ],
  // ClassicCardController/Service and UserController/Service are registered by
  // their own modules (imported above); re-declaring them here would create
  // duplicate instances, so AppModule only owns its own controller/service.
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
