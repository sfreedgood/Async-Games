import { Controller, Get } from '@nestjs/common';
import { CardService } from './service';
import type {
  CardName,
  CardSuit,
  StandardDeckOptions,
} from '../../../entities/card';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getCard(name: CardName, suit: CardSuit) {
    return this.cardService.getCard(name, suit);
  }

  @Get('deck') // For testing, change to Post
  buildStandardDeck(options?: StandardDeckOptions) {
    return this.cardService.buildStandardDeck(options);
  }
}
