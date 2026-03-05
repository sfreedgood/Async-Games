import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import {
  ClassicCardModule,
  ClassicCardController,
  ClassicCardService,
} from './domains/classic-card';
import { UserModule } from './domains/common/user/module';
import { UserController, UserService } from './domains/common/user';

// Choose env file based on NODE_ENV: production uses .env, development uses .env.development with .env fallback
const isProduction = process.env.NODE_ENV === 'production';
const envFilePath = isProduction ? '.env' : ['.env.development', '.env'];

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    envFilePath,
    load: [databaseConfig],
  }),
  ClassicCardModule,
  UserModule,
];

// Only import DatabaseModule if DB_SKIP is not set to 'true'
if (process.env.DB_SKIP !== 'true') {
  imports.splice(1, 0, DatabaseModule);
}

@Module({
  imports,
  controllers: [AppController, ClassicCardController, UserController],
  providers: [AppService, ClassicCardService, UserService],
})
export class AppModule {}
