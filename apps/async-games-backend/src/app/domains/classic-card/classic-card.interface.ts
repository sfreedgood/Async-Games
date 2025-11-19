import { Card, requiredCardFields } from '../../../abstract/card';

export const requiredClassicCardFields = [
  ...requiredCardFields,
  'suit',
] as const;

export type RequiredClassicCardFields =
  (typeof requiredClassicCardFields)[number];
export type ClassicCardFields = Record<
  RequiredClassicCardFields[number],
  any
> & {
  [key: string]: any;
};

export interface ClassicPlayingCard extends Card<ClassicCardFields> {
  value: number;
  isTrumpSuit?: boolean;
  color: string | null;
  name: string;
  suit: string;
}

const classicCardSuits = {
  spade: 'spade',
  heart: 'heart',
  club: 'club',
  diamond: 'diamond',
} as const;

const classicCardValues = {
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

type ClassicCardValueDef = typeof classicCardValues & typeof joker;
type ClassicCardValue =
  | (typeof classicCardValues)[keyof typeof classicCardValues]
  | typeof joker.joker;
type BaseClassicCardName = keyof typeof classicCardValues;
type Joker = keyof typeof joker;
type ClassicCardName = BaseClassicCardName | Joker;
type ClassicCardSuit = keyof typeof classicCardSuits | 'joker';

type ClassicPlayingCardProperties = {
  name: ClassicCardName;
  suit: ClassicCardSuit;
  value: ClassicCardValue;
};

type ClassicCardOptions = {
  aceLow?: boolean;
  valueOverrides?: Partial<Record<keyof ClassicCardValueDef, ClassicCardValue>>;
};

export { classicCardSuits, classicCardValues, joker };

export type {
  ClassicCardValue,
  BaseClassicCardName,
  Joker,
  ClassicCardName,
  ClassicCardSuit,
  ClassicPlayingCardProperties,
  ClassicCardOptions,
};
