import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClassicCardService } from './service';
import type { ClassicCardSuit } from './classic-card.interface';
import { ClassicDeck, type ClassicDeckOptions } from './classic-card.entity';
import { ClassicDeckOptionsDTO } from './classic-card.dto';

@Controller('card')
export class ClassicCardController {
  constructor(private readonly ClassicCardService: ClassicCardService) {}

  @Get() // TODO: get specific deck by id, building each time now for POC
  async findAll(@Param() options?: ClassicDeckOptions) {
    return new ClassicDeck(options);
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

  @Put('deck')
  async setTrump(@Param() trumpSuit: ClassicCardSuit) {
    return this.ClassicCardService.setTrump(trumpSuit);
  }
}
