import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayerZone } from './PlayerArea';

const meta = {
  component: PlayerZone,
  title: 'Domains/Table/PlayerArea'
} satisfies Meta<typeof PlayerZone>;
export default meta;

type Story = StoryObj<typeof PlayerZone>;

export const Primary = {
  args: {
    player: {id: '1234', name: 'Player 1'},
    isLocalPlayer: true,
  },
} satisfies Story;

export const Opponent = {
  args: {
    player: {id: '1234', name: 'Player 2'},
    isLocalPlayer: false,
  },
} satisfies Story;