import { Controller, Get } from '@nestjs/common';
import { CardService } from './service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getData() {
    return this.cardService.getData();
  }
}
