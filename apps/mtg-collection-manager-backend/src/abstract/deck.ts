export abstract class Deck<T> {
  item: T[];

  constructor(item: T[]) {
    this.item = item;
  }

  shuffle() {
    // TODO
  }

  draw(quantity = 1) {
    return this.item.splice(0, quantity);
  }
}
