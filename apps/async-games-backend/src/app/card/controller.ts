import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CardService } from './service';
import type { CardSuit } from './card.interface';
import { StandardDeck, type StandardDeckOptions } from './card.entity';
import { StandardDeckOptionsDTO } from './card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get() // TODO: get specific deck by id, building each time now for POC
  async findAll(@Param() options?: StandardDeckOptions) {
    return new StandardDeck(options);
  }

  // TODO: update to use true id or request body instead of params
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const [name, suit] = id.split(',');

    return this.cardService.getCard(name, suit);
  }

  @Post('deck')
  async create(@Body() body: StandardDeckOptionsDTO) {
    return this.cardService.getAllCardsInDeck(body);
  }

  @Put('deck')
  async setTrump(@Param() trumpSuit: CardSuit) {
    return this.cardService.setTrump(trumpSuit);
  }
}
