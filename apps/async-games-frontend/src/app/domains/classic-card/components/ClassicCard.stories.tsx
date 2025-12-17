import { Meta, StoryObj } from '@storybook/react';
import { ClassicCard } from './ClassicCard';
import { classicCardValues, classicCardSuits } from '../entities/card';

export default {
  title: 'Domains/Card/ClassicCard',
  component: ClassicCard,
  argTypes: {
    name: {
      options: Object.keys(classicCardValues),
    },
    suit: {
      options: Object.keys(classicCardSuits),
    },
  },
} satisfies Meta<typeof ClassicCard>;

type Story = StoryObj<typeof ClassicCard>;

export const ClassicPlayingCard = {
  args: {
    name: '2',
    suit: 'club',
  },
} satisfies Story;

export const Joker = {
  argTypes: {
    name: {
      options: ['Joker'],
    },
    suit: {
      options: ['Joker'],
    },
  },
  args: {
    name: 'Joker',
    suit: 'Joker',
  },
} satisfies Story;
