import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config/database.config';
import { DatabaseService } from './database.service';
import { ActiveGameEntity, HeartEntity, UserEntity } from './entities';
import {
  ActiveGameRepository,
  HeartRepository,
  UserRepository,
} from './repositories';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        if (!dbConfig) {
          throw new Error('database configuration is not defined');
        }

        // schema synchronize auto-alters tables from entity decorators on every
        // boot — convenient in dev, but against a shared/prod database it can
        // silently drop or rewrite columns (data loss). It is therefore refused
        // in production unless explicitly opted into via
        // DB_ALLOW_SYNCHRONIZE_IN_PRODUCTION=true (used only by CI's ephemeral
        // database). Real schema management should move to versioned migrations.
        // TODO: replace synchronize with TypeORM migrations.
        const inProduction = process.env.NODE_ENV === 'production';
        const allowProdSync =
          process.env.DB_ALLOW_SYNCHRONIZE_IN_PRODUCTION === 'true';
        const synchronize = dbConfig.synchronize && (!inProduction || allowProdSync);
        if (dbConfig.synchronize && inProduction) {
          const logger = new Logger(DatabaseModule.name);
          if (allowProdSync) {
            logger.warn(
              'DB_SYNCHRONIZE is enabled in production via DB_ALLOW_SYNCHRONIZE_IN_PRODUCTION — schema will be auto-synced. Do NOT use against a real database.'
            );
          } else {
            logger.warn(
              'DB_SYNCHRONIZE was requested in production but is ignored. Set DB_ALLOW_SYNCHRONIZE_IN_PRODUCTION=true to override (unsafe), or use migrations.'
            );
          }
        }

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          logging: dbConfig.logging,
          // When SSL is enabled, verify the server certificate by default.
          // Supply a CA bundle via DB_SSL_CA, or disable verification
          // explicitly with DB_SSL_REJECT_UNAUTHORIZED=false.
          ssl: dbConfig.ssl
            ? {
                rejectUnauthorized: dbConfig.sslRejectUnauthorized,
                ...(dbConfig.sslCa ? { ca: dbConfig.sslCa } : {}),
              }
            : false,
          synchronize,
          // Fail fast on an unreachable/misconfigured database instead of
          // retrying the default 10 times (~30s) and leaving boot hanging.
          // Override via env when a slower startup race is expected (e.g. a DB
          // container coming up alongside the app).
          retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS ?? 5),
          retryDelay: Number(process.env.DB_RETRY_DELAY_MS ?? 2000),
          connectTimeoutMS: Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 10000),
          entities: [UserEntity, ActiveGameEntity, HeartEntity],
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, ActiveGameEntity, HeartEntity]),
  ],
  providers: [
    DatabaseService,
    UserRepository,
    ActiveGameRepository,
    HeartRepository,
  ],
  exports: [
    TypeOrmModule,
    DatabaseService,
    UserRepository,
    ActiveGameRepository,
    HeartRepository,
  ],
})
export class DatabaseModule {}
