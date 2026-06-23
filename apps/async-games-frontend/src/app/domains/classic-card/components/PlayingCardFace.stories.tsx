import { Meta, StoryObj } from '@storybook/react-vite';
import { PlayingCardFace } from './PlayingCardFace';

export default {
  title: 'Domains/Card/PlayingCardFace',
  component: PlayingCardFace,
  parameters: { backgrounds: { default: 'felt' } },
} satisfies Meta<typeof PlayingCardFace>;

type Story = StoryObj<typeof PlayingCardFace>;

export const TwoOfClubs = {
  args: { card: { name: '2', suit: 'club' } },
} satisfies Story;

export const SevenOfDiamonds = {
  args: { card: { name: '7', suit: 'diamond' } },
} satisfies Story;

export const TenOfHearts = {
  args: { card: { name: '10', suit: 'heart' } },
} satisfies Story;

export const QueenOfSpades = {
  args: { card: { name: 'Q', suit: 'spade' } },
} satisfies Story;

export const AceOfHearts = {
  args: { card: { name: 'A', suit: 'heart' } },
} satisfies Story;

export const Selected = {
  args: { card: { name: 'K', suit: 'spade' }, selected: true },
} satisfies Story;

export const Disabled = {
  args: { card: { name: '3', suit: 'club' }, disabled: true },
} satisfies Story;
