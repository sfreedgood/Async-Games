import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClassicCardService } from './service';
import type { ClassicCardSuit } from './classic-card.interface';
import { ClassicDeckOptionsDTO, ShuffleDeckDTO } from './classic-card.dto';

@Controller('cards')
export class ClassicCardController {
  constructor(private readonly ClassicCardService: ClassicCardService) {}

  @Get('deck')
  getDeck() {
    return this.ClassicCardService.getAllCardsInDeck();
  }

  // TODO: update to use true id or request body instead of params
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const [name, suit] = id.split(',');

    return this.ClassicCardService.getCard(name, suit);
  }

  @Post('deck')
  async create(@Body() body: ClassicDeckOptionsDTO) {
    return this.ClassicCardService.getAllCardsInDeck(body);
  }

  @Post('deck/shuffle')
  shuffleDeck(@Body() body: ShuffleDeckDTO) {
    return this.ClassicCardService.shuffle(body.id);
  }

  @Put('deck')
  async setTrump(@Param() trumpSuit: ClassicCardSuit) {
    return this.ClassicCardService.setTrump(trumpSuit);
  }
}
