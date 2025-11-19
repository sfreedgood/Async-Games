import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

// import { expect } from 'storybook/test';

const meta = {
  component: Table,
  title: 'Table',
  args: {
    players: [{ name: 'Player 1', id: '12345' }],
  },
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof Table>;

export const SinglePlayer = {} satisfies Story;

export const TwoPlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345' },
      { name: 'Player 2', id: '23456' },
    ],
  },
};

export const ThreePlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345' },
      { name: 'Player 2', id: '23456' },
      { name: 'Player 3', id: '34567' },
    ],
  },
};

export const FourPlayers = {
  args: {
    players: [
      { name: 'Player 1', id: '12345' },
      { name: 'Player 2', id: '23456' },
      { name: 'Player 3', id: '34567' },
      { name: 'Player 4', id: '45678' },
    ],
  },
};

// export const Heading = {
//   args: {},
//   play: async ({ canvas }) => {
//     await expect(canvas.getByText(/Table/gi)).toBeTruthy();
//   },
// } satisfies Story;
