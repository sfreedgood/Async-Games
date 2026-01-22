import { HttpException, Injectable } from '@nestjs/common';
import type { ClassicCardSuit } from './classic-card.interface';
import {
  type ClassicDeckOptions,
  ClassicDeck,
  ClassicPlayingCard,
} from './classic-card.entity';
import { validateCard } from './classic-card.validator';

@Injectable()
export class ClassicCardService {
  getCard(name: string, suit: string): ClassicPlayingCard {
    try {
      return validateCard({ name, suit });
    } catch (error) {
      throw error as HttpException;
    }
  }

  /**
   *
   * @param options
   * @returns {ClassicDeck} All cards in the deck
   */
  getAllCardsInDeck(options?: ClassicDeckOptions) {
    return new ClassicDeck(options).cards;
  }

  setTrump(trumpSuit: ClassicCardSuit) {
    // Todo: Introduce trump functionality
  }

  shuffle(_deckId: string) {
    return new ClassicDeck().shuffle();
  }
}
