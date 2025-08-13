export abstract class Deck<T> {
  items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  shuffle() {
    // TODO
  }

  draw(quantity = 1) {
    return this.items.splice(0, quantity);
  }
}
