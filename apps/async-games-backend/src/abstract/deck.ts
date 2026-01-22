export class Deck<T> {
  cards: T[];

  constructor(cards: T[]) {
    this.cards = cards;
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[swapIndex]] = [
        this.cards[swapIndex],
        this.cards[i],
      ];
    }

    return this.cards;
  }

  draw(quantity = 1) {
    return this.cards.splice(0, quantity);
  }

  deal(quantity: number): T[] {
    return this.draw(quantity);
  }
}
