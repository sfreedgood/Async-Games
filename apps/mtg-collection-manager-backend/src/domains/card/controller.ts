import { Controller, Get } from '@nestjs/common';
import { CardService } from './service';
import type { StandardDeckOptions } from '../../entities/card';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getData() {
    return this.cardService.getData();
  }

  @Get('deck') // For testing, change to Post
  buildStandardDeck(options?: StandardDeckOptions) {
    return this.cardService.buildStandardDeck(options);
  }
}
