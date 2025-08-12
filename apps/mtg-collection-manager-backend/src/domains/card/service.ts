import { Injectable } from '@nestjs/common';
import {
  StandardDeck,
  StandardDeckOptions,
  StandardPlayingCard,
} from '../../entities/card';

@Injectable()
export class CardService {
  getData(): StandardPlayingCard {
    return new StandardPlayingCard('3', 'heart');
  }

  buildStandardDeck(options?: StandardDeckOptions): StandardDeck {
    return new StandardDeck(options);
  }
}
