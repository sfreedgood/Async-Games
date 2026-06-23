import { Meta, StoryObj } from '@storybook/react-vite';
import { CardBack } from './CardBack';

export default {
  title: 'Domains/Card/CardBack',
  component: CardBack,
} satisfies Meta<typeof CardBack>;

type Story = StoryObj<typeof CardBack>;

export const Default = {} satisfies Story;
