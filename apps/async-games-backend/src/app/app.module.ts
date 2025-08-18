import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardController } from '../domains/card/controller';
import { CardService } from '../domains/card/service';
import { CollectionService } from '../domains/collection/service';
import { CollectionController } from '../domains/collection/controller';
import { CollectionModule } from '../domains/collection/module';
import { CardModule } from '../domains/card/module';

@Module({
  imports: [CollectionModule, CardModule],
  controllers: [AppController, CardController, CollectionController],
  providers: [AppService, CardService, CollectionService],
})
export class AppModule {}
