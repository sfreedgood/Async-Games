export abstract class Deck<T> {
  cards: T[];

  constructor(cards: T[]) {
    this.cards = cards;
  }

  shuffle() {
    // TODO
  }

  draw(quantity = 1) {
    return this.cards.splice(0, quantity);
  }
}
