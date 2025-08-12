import { Module } from '@nestjs/common';
import { CardController } from './controller';
import { CardService } from './service';

@Module({
  imports: [CardModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
