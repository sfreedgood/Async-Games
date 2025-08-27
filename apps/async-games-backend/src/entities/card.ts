import { Card } from '../abstract/card';
import { Deck } from '../abstract/deck';

const standardSuits = {
  spade: 'spade',
  heart: 'heart',
  club: 'club',
  diamond: 'diamond',
} as const;

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

const joker = {
  Joker: 15,
} as const;

type CardValue = typeof standardValues & typeof joker;
type CardName = keyof typeof standardValues | keyof typeof joker;
type CardSuit = keyof typeof standardSuits | 'joker';

type CardOptions = {
  aceLow?: boolean;
  valueOverrides?: Partial<CardValue>;
};

export class StandardPlayingCard extends Card {
  trump?: boolean;
  constructor(name: CardName, type: CardSuit, options?: CardOptions) {
    let value: number;
    if (name === 'Joker') {
      value = options?.valueOverrides?.['Joker'] || joker.Joker;
    } else {
      value =
        options?.aceLow === true && name === 'A' ? 1 : standardValues[name];
      value = options?.valueOverrides?.[name] ?? value;
    }

    super(name, type, value);
  }

  get color() {
    if (this.type === standardSuits.spade || this.type === standardSuits.club) {
      return 'black';
    }
    if (
      this.type === standardSuits.heart ||
      this.type === standardSuits.diamond
    ) {
      return 'red';
    }
    return null;
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

export type StandardDeckOptions = {
  aceLow?: boolean;
  jokers?: number;
};

function buildStandardDeck(
  deckOptions?: StandardDeckOptions
): StandardPlayingCard[] {
  function buildSuit(suit: CardSuit): StandardPlayingCard[] {
    return Object.keys(standardValues).map(
      (k) =>
        new StandardPlayingCard(k as CardName, suit, {
          aceLow: deckOptions?.aceLow,
        })
    );
  }

  const cards = Object.values(standardSuits).flatMap((suit) => buildSuit(suit));

  if (deckOptions?.jokers) {
    let jokerCount = deckOptions.jokers;
    for (let i = 0; i < jokerCount; i++) {
      cards.push(new StandardPlayingCard('Joker', 'joker'));
    }
  }

  return cards;
}

export class StandardDeck extends Deck<StandardPlayingCard> {
  constructor(deckOptions?: StandardDeckOptions) {
    const cards = buildStandardDeck(deckOptions);
    super(cards);
  }
}
