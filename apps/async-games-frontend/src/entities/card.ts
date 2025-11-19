export const requiredStandardCardFields = ['name', 'type', 'value'] as const;
export type requiredStandardCardFields =
  (typeof requiredStandardCardFields)[number];
export type CardFields = Record<requiredStandardCardFields[number], any> & {
  [key: string]: any;
};

// Generic
export interface CardEntity<T extends CardFields> {
  id: string;
  name: T['name'];
  type: T['type'];
  value: T['value'];
}

// Standard Playing Card
export const standardSuits = {
  spade: 'spade',
  heart: 'heart',
  club: 'club',
  diamond: 'diamond',
} as const;

export const standardValues = {
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

export const joker = {
  Joker: 15,
} as const;

export type StandardCardName = keyof typeof standardValues;
export type Joker = keyof typeof joker;

export type CardSuit = keyof typeof standardSuits;

export type StandardPlayingCard = {
  name: StandardCardName | Joker;
  suit: CardSuit | Joker;
} & { primaryValue?: number };
