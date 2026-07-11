import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { HeartsService } from './service';
import { CreateGameDTO, PassCardsDTO, PlayCardDTO } from './hearts.dto';
import type { CardRef, SeatIndex } from './hearts.interface';

// DTO card refs are validated as plain strings at the HTTP boundary by the
// global ValidationPipe; the engine validator re-checks them against the hand,
// so we narrow to CardRef here.
const toCardRef = (dto: { name: string; suit: string }): CardRef =>
  dto as CardRef;

@Controller('hearts')
export class HeartsController {
  constructor(private readonly heartsService: HeartsService) {}

  @Post('games')
  createGame(@Body() body: CreateGameDTO) {
    return this.heartsService.createGame(body.humanName, body.seed);
  }

  @Get('games/:id')
  getGame(
    @Param('id') id: string,
    @Query('viewerSeat') viewerSeat?: string
  ) {
    const seat = (viewerSeat ? Number(viewerSeat) : 0) as SeatIndex;
    return this.heartsService.getGame(id, seat);
  }

  @Post('games/:id/pass')
  passCards(@Param('id') id: string, @Body() body: PassCardsDTO) {
    return this.heartsService.passCards(id, body.seat, body.cards.map(toCardRef));
  }

  @Post('games/:id/play')
  playCard(@Param('id') id: string, @Body() body: PlayCardDTO) {
    return this.heartsService.playCard(id, body.seat, toCardRef(body.card));
  }

  @Post('games/:id/advance')
  advanceTrick(@Param('id') id: string) {
    return this.heartsService.advanceTrick(id);
  }

  @Delete('games/:id')
  @HttpCode(204)
  deleteGame(@Param('id') id: string) {
    this.heartsService.deleteGame(id);
  }
}
