import { Injectable } from '@nestjs/common';
import {
  CardDTO,
  CardName,
  CardSuit,
  StandardDeck,
  StandardDeckOptions,
  StandardPlayingCard,
} from '../../../entities/card';

@Injectable()
export class CardService {
  getCard(name: CardName, suit: CardSuit): StandardPlayingCard {
    return new StandardPlayingCard(name, suit);
  }

  buildStandardDeck(options?: StandardDeckOptions): CardDTO[] {
    return new StandardDeck(options).getAsDTO();
  }
}
