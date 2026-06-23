import { shuffleInPlace } from '../utils/random';

export class Deck<T> {
  cards: T[];

  constructor(cards: T[]) {
    this.cards = cards;
  }

  /**
   * Shuffles the deck in place. Pass a seed for a reproducible order
   * (used by game dealing for deterministic tests); omit it for a
   * non-deterministic shuffle backed by Math.random.
   */
  shuffle(seed?: number): this {
    shuffleInPlace(this.cards, seed);
    return this;
  }

  draw(quantity = 1) {
    return this.cards.splice(0, quantity);
  }

  deal(quantity: number): T[] {
    return this.draw(quantity);
  }
}
