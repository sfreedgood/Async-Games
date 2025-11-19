import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ClassicCardModule,
  ClassicCardController,
  ClassicCardService,
} from './domains/classic-card';

@Module({
  imports: [ClassicCardModule],
  controllers: [AppController, ClassicCardController],
  providers: [AppService, ClassicCardService],
})
export class AppModule {}
