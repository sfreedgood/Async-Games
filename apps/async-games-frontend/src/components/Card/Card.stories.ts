import { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { standardValues, standardSuits } from '../../entities/card';

export default {
  title: 'Card',
  component: Card,
  argTypes: {
    name: {
      options: Object.keys(standardValues),
    },
    suit: {
      options: Object.keys(standardSuits),
    },
  },
} satisfies Meta<typeof Card>;

type Story = StoryObj<typeof Card>;

export const StandardPlayingCard = {
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
