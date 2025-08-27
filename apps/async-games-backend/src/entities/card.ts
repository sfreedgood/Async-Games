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
export type CardName = StandardCardName | Joker;
export type CardSuit = keyof typeof standardSuits | 'joker';

type StandardPlayingCardProperties = {
  name: CardName;
  type: CardSuit;
  value: CardValue;
};

type CardOptions = {
  aceLow?: boolean;
  valueOverrides?: Partial<Record<keyof CardValueDef, CardValue>>;
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
  override name: CardName;
  options?: CardOptions;
  isTrumpSuit?: boolean;

  constructor(name: CardName, type: CardSuit, options?: CardOptions) {
    const value = handleCardOptions(name, options);
    super(name, type, value);
    this.type = type;
    this.name = name;
    this.options = options;
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

  makeAceLow(value: boolean) {
    if (this.name !== 'A') {
      console.error('method not applicable to selected card, ignoring'); // placeholder for validations and error handling
      return;
    }
    if (this.name === 'A' && value) {
      this.value = 1 as CardValue;
    } else {
      this.value = this.options?.valueOverrides?.A
        ? this.options?.valueOverrides?.A
        : standardValues['A'];
    }
  }

  setTrumpSuit(suit: CardSuit) {
    this.isTrumpSuit = this.type === suit ? true : false;
  }

  getAsDTO = (): CardDTO => {
    return {
      name: this.name,
      suit: this.type,
      value: this.value,
      isTrumpSuit: this.isTrumpSuit,
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
    const jokerCount = deckOptions.jokers;
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
  isTrumpSuit?: boolean;
  color: string | null;
} & {
  name: StandardCardName | Joker;
  suit: CardSuit | Joker;
};