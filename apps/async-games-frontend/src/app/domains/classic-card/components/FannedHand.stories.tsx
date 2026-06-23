import { Meta, StoryObj } from '@storybook/react-vite';
import { FannedHand, cardKey } from './FannedHand';
import type { PlayingCardRef } from './PlayingCardFace';

const sampleHand: PlayingCardRef[] = [
  { name: '2', suit: 'club' },
  { name: '5', suit: 'club' },
  { name: '9', suit: 'club' },
  { name: '4', suit: 'diamond' },
  { name: '10', suit: 'diamond' },
  { name: 'K', suit: 'diamond' },
  { name: '3', suit: 'spade' },
  { name: 'J', suit: 'spade' },
  { name: 'Q', suit: 'spade' },
  { name: '6', suit: 'heart' },
  { name: '8', suit: 'heart' },
  { name: 'Q', suit: 'heart' },
  { name: 'A', suit: 'heart' },
];

export default {
  title: 'Domains/Card/FannedHand',
  component: FannedHand,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FannedHand>;

type Story = StoryObj<typeof FannedHand>;

export const FullHand = {
  args: { cards: sampleHand },
} satisfies Story;

export const WithLegalAndSelected = {
  args: {
    cards: sampleHand,
    legalKeys: new Set(sampleHand.filter((c) => c.suit === 'club').map(cardKey)),
    selectedKeys: new Set([cardKey({ name: 'Q', suit: 'spade' })]),
  },
} satisfies Story;
