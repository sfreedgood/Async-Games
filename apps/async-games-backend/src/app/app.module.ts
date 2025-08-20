import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from '../domains/common/card/module';
import { CardController } from '../domains/common/card/controller';
import { CardService } from '../domains/common/card/service';

@Module({
  imports: [CardModule],
  controllers: [AppController, CardController],
  providers: [AppService, CardService],
})
export class AppModule {}
