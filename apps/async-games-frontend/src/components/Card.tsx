import React from 'react';

import { Spade, Club, Diamond, Heart } from '../assets/svgs';
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
  Joker: 15,
} as const;

type CardValue = typeof standardValues & typeof joker;
type StandardCardName = keyof typeof standardValues;
type Joker = keyof typeof joker;
type CardName = StandardCardName | Joker;
type CardSuit<CardName> =
  | {
      [Joker in keyof CardName]: null;
    };

// CardName extends StandardCardName
//   ? null
//   : keyof typeof standardSuits;

//   type OptionsFlags<Type> = {
//     [Property in keyof Type]: boolean;
//   };

interface CardProps {
  name: CardName;
  suit: CardSuit<CardName>;
}

export const Card = (props: CardProps) => {
  let { suit, name } = props;
  // const scale = suit === 'joker' || name === 'Joker' ? undefined : 48;

  return (
    <div className="w-32 h-48 border border-gray-300 rounded-lg shadow-lg relative">
      <div className="absolute top-2 left-2 text-2xl font-bold">{name}</div>
      <div className="absolute bottom-2 right-2 text-2xl font-bold">{name}</div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">
        <Icon height={scale} width={scale} icon={suit} />
      </div>
    </div>
  );
};
