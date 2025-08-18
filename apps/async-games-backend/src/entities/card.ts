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
  joker: 15,
} as const;

type CardValueDef = typeof standardValues & typeof joker;
type CardValue =
  | (typeof standardValues)[keyof typeof standardValues]
  | typeof joker.joker;
type StandardCardName = keyof typeof standardValues;
type Joker = keyof typeof joker;
type CardName = StandardCardName | Joker;
export type CardSuit = keyof typeof standardSuits | 'joker';

type StandardPlayingCardProperties = {
  name: CardName;
  type: CardSuit;
  value: CardValue;
};

type CardOptions = {
  aceLow?: boolean;
  valueOverrides?: Partial<CardValueDef>;
};

function handleCardOptions(name: CardName, options?: CardOptions): CardValue {
  let value: CardValue;
  if (name === 'joker') {
    value = options?.valueOverrides?.['joker'] || joker.joker;
  } else {
    value =
      options?.aceLow === true && name === 'A'
        ? (1 as CardValue)
        : standardValues[name];
    value = options?.valueOverrides?.[name] ?? value;
  }
  return value;
}

export class StandardPlayingCard extends Card<StandardPlayingCardProperties> {
  trump?: boolean;
  override name: CardName;

  constructor(name: CardName, type: CardSuit, options?: CardOptions) {
    const value = handleCardOptions(name, options);
    super(name, type, value);
    this.type = type;
    this.name = name;
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
      this.value = 1 as CardValue;
    } else {
      this.value = standardValues['A'];
    }
  }

  set trumpSuit(suit: CardSuit) {
    this.trump = this.type === suit ? true : false;
  }

  get isTrump(): boolean | undefined {
    return this.trump || undefined;
  }

  getAsDTO = (): CardDTO => {
    return {
      name: this.name,
      suit: this.type,
      value: this.value,
      isTrump: this.isTrump,
      color: this.color,
    };
  };
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
        new StandardPlayingCard(k as StandardCardName, suit, {
          aceLow: deckOptions?.aceLow,
        })
    );
  }

  const cards = Object.values(standardSuits).flatMap((suit) => buildSuit(suit));

  if (deckOptions?.jokers) {
    let jokerCount = deckOptions.jokers;
    for (let i = 0; i < jokerCount; i++) {
      cards.push(new StandardPlayingCard('joker', 'joker'));
    }
  }

  return cards;
}

export class StandardDeck extends Deck<StandardPlayingCard> {
  constructor(deckOptions?: StandardDeckOptions) {
    const cards = buildStandardDeck(deckOptions);
    super(cards);
  }

  getAsDTO = (): CardDTO[] => {
    return this.cards.map((card) => {
      return card.getAsDTO();
    });
  };
}

export type CardDTO = {
  value: CardValue;
  isTrump?: boolean;
  color: string | null;
} & {
  name: StandardCardName | Joker;
  suit: CardSuit | Joker;
};