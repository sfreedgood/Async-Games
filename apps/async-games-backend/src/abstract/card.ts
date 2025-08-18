export class Card {
  name: string;
  type: string;
  primaryValue: number;

  constructor(name: string, type: string, primaryValue: number) {
    this.name = name;
    this.type = type;
    this.primaryValue = primaryValue;
  }
}
