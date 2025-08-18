import { Injectable } from '@nestjs/common';
import {
  CardDTO,
  StandardDeck,
  StandardDeckOptions,
  StandardPlayingCard,
} from '../../entities/card';

@Injectable()
export class CardService {
  getData(): StandardPlayingCard {
    return new StandardPlayingCard('3', 'heart');
  }

  buildStandardDeck(options?: StandardDeckOptions): CardDTO[] {
    return new StandardDeck(options).getAsDTO();
  }
}
