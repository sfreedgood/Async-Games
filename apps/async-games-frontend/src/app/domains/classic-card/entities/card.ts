export const requiredClassicCardFields = ['name', 'suit', 'value'] as const;
export type RequiredClassicCardFields =
  (typeof requiredClassicCardFields)[number];
export type ClassicCardFields = Record<
  RequiredClassicCardFields,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Generic
export interface ClassicCardEntity<T extends ClassicCardFields> {
  id: string;
  name: T['name'];
  suit: T['suit'];
  value: T['value'];
}

// Classic Playing Card
export const classicCardSuits = {
  spade: 'spade',
  heart: 'heart',
  club: 'club',
  diamond: 'diamond',
} as const;

export const classicCardValues = {
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

export type ClassicCardName = keyof typeof classicCardValues;
export type Joker = keyof typeof joker;

export type ClassicCardSuit = keyof typeof classicCardSuits;

export type ClassicPlayingCard = {
  name: ClassicCardName | Joker;
  suit: ClassicCardSuit | Joker;
} & { primaryValue?: number };
