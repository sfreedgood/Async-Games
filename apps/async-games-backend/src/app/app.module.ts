import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule, CardController, CardService } from './card';

@Module({
  imports: [CardModule],
  controllers: [AppController, CardController],
  providers: [AppService, CardService],
})
export class AppModule {}
