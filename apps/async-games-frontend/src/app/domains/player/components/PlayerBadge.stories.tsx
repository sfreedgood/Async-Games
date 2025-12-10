import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayerBadge } from './PlayerBadge';

const meta = {
  component: PlayerBadge,
  title: 'Domains/Player/Badge',
  args: {
      name: 'Player 1',
      settings: { isDealer: true, showHints: true },
    isLocalPlayer: true,
  },
} satisfies Meta<typeof PlayerBadge>;
export default meta;

type Story = StoryObj<typeof PlayerBadge>;

export const PrimaryPlayer = {} satisfies Story;
export const OtherPlayer = {
  args: {
      name: 'Player 2',
      settings: { isDealer: true, showHints: true },
    isLocalPlayer: false,
  }
} satisfies Story
