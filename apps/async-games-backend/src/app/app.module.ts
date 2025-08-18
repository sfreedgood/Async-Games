import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from '../domains/card/module';
import { CardController } from '../domains/card/controller';
import { CardService } from '../domains/card/service';

@Module({
  imports: [CardModule],
  controllers: [AppController, CardController],
  providers: [AppService, CardService],
})
export class AppModule {}
