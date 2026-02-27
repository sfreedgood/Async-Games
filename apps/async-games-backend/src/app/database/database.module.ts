import { Module } from '@nestjs/common';
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
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          logging: dbConfig.logging,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
          synchronize: dbConfig.synchronize,
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
