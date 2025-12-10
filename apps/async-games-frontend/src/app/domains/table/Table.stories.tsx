import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

const meta = {
  component: Table,
  title: 'Domains/Table',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    players: [
      {
        name: 'Player 1',
        id: '12345',
        settings: { isDealer: true, showHints: true },
      },
    ],
  },
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof Table>;

export const SinglePlayer = {} satisfies Story;

export const TwoPlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345', settings: { isDealer: true } },
      { name: 'Player 2', id: '23456' },
    ],
  },
} satisfies Story;

export const ThreePlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345', settings: { isDealer: true } },
      { name: 'Player 2', id: '23456', settings: { isMuted: true } },
      { name: 'Player 3', id: '34567', settings: { showHints: true } },
    ],
  },
} satisfies Story;

export const FourPlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345', settings: { isDealer: true } },
      { name: 'Player 2', id: '23456' },
      { name: 'Player 3', id: '34567', settings: { showHints: true } },
      { name: 'Player 4', id: '45678', settings: { isMuted: true } },
    ],
  },
} satisfies Story;
