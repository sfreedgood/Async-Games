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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig],
    }),
    DatabaseModule,
    ClassicCardModule,
    UserModule,
  ],
  controllers: [AppController, ClassicCardController, UserController],
  providers: [AppService, ClassicCardService, UserService],
})
export class AppModule {}
