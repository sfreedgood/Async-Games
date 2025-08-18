import React from 'react';

import Icon from './Icon';

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

type StandardCardName = keyof typeof standardValues;
type Joker = keyof typeof joker;

type CardSuit = keyof typeof standardSuits;

export type CardProps = {
  name: StandardCardName | Joker;
  suit: CardSuit | Joker;
} & { primaryValue?: number };

export const Card = ({ name, suit, primaryValue }: CardProps) => {
  return (
    <div className="w-32 h-48 border border-gray-300 rounded-lg shadow-lg relative">
      <div className="absolute top-2 left-2 text-2xl font-bold">{name}</div>
      <div className="absolute bottom-2 right-2 text-2xl font-bold">{name}</div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">
        {name === 'joker' ? (
          <Icon icon={'joker'} />
        ) : (
          <Icon height={48} width={48} icon={suit} />
        )}
      </div>
    </div>
  );
};
