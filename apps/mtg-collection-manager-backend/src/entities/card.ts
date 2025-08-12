import { Card } from '../abstract/card';
import { Deck } from '../abstract/deck';

const standardSuits = ['spade', 'heart', 'club', 'diamond'] as const;
const standardValues = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
} as const;

type CardName = keyof typeof standardValues;
type CardSuit = (typeof standardSuits)[number];

export class StandardPlayingCard extends Card {
  trump?: boolean;
  constructor(name: CardName, type: CardSuit) {
    super(name, type, standardValues[name]);
  }

  get color() {
    return this.type === 'spade' || this.type === 'club' ? 'black' : 'red';
  }

  set aceLow(value: boolean) {
    if (this.name === 'A' && value) {
      this.primaryValue = 1;
    } else {
      this.primaryValue = 14;
    }
  }

  set trumpSuit(suit: CardSuit) {
    this.trump = this.type === suit ? true : false;
  }

  get isTrump(): Boolean | null {
    return this.trump || null;
  }
}

export class StandardDeck extends Deck<Card> {}
