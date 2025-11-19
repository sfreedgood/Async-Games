import { HttpException, Injectable } from '@nestjs/common';
import type { CardSuit } from './card.interface';
import {
  type StandardDeckOptions,
  StandardDeck,
  StandardPlayingCard,
} from './card.entity';
import { validateCard } from './card.validator';

@Injectable()
export class CardService {
  getCard(name: string, suit: string): StandardPlayingCard {
    try {
      return validateCard({ name, suit });
    } catch (error) {
      throw error as HttpException;
    }
  }

  /**
   *
   * @param options
   * @returns {StandardDeck} All cards in the deck
   */
  getAllCardsInDeck(options?: StandardDeckOptions) {
    return new StandardDeck(options).cards;
  }

  setTrump(trumpSuit: CardSuit) {
    // Todo: Introduce trump functionality
  }

  shuffle(deckId: string) {}
}
