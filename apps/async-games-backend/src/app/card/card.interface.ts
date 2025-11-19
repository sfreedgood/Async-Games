export interface StandardPlayingCard {
  value: number;
  isTrumpSuit?: boolean;
  color: string | null;
  name: string;
  suit: string;
}

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
type CardSuit = keyof typeof standardSuits | 'joker';

type StandardPlayingCardProperties = {
  name: CardName;
  suit: CardSuit;
  value: CardValue;
};

type CardOptions = {
  aceLow?: boolean;
  valueOverrides?: Partial<Record<keyof CardValueDef, CardValue>>;
};

export { standardSuits, standardValues, joker };

export type {
  CardValue,
  StandardCardName,
  Joker,
  CardName,
  CardSuit,
  StandardPlayingCardProperties,
  CardOptions,
};
