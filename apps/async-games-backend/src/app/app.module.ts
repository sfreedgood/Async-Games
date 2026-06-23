import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ClassicCardModule,
  ClassicCardController,
  ClassicCardService,
} from './domains/classic-card';
import {
  HeartsModule,
  HeartsController,
  HeartsService,
  HeartsStore,
} from './domains/hearts';

@Module({
  imports: [ClassicCardModule, HeartsModule],
  controllers: [AppController, ClassicCardController, HeartsController],
  providers: [AppService, ClassicCardService, HeartsService, HeartsStore],
})
export class AppModule {}
