export abstract class Card {
  name;
  type;
  primaryValue;

  constructor(name: any, type: any, primaryValue: number) {
    this.name = name;
    this.type = type;
    this.primaryValue = primaryValue;
  }
}
