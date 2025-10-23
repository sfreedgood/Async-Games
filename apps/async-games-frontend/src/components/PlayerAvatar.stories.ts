import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayerAvatar } from './PlayerAvatar';
// import { expect } from 'storybook/test';

const meta = {
  component: PlayerAvatar,
  title: 'PlayerAvatar',
  args: {
    player: { name: 'Player 1', id: '12345' },
    position: 0,
    totalPlayers: 1,
  },
} satisfies Meta<typeof PlayerAvatar>;
export default meta;

type Story = StoryObj<typeof PlayerAvatar>;

export const SinglePlayer = {} satisfies Story;

// export const TwoPlayerPlayer1 = {
//   title: 'PlayerAvatar/TwoPlayer/Player1',
//   args: {
//     position: 0,
//     totalPlayers: 2,
//   },
// };

// export const TwoPlayerPlayer2 = {
//   title: 'PlayerAvatar/TwoPlayer/Player2',
//   args: {
//     position: 1,
//     totalPlayers: 2,
//   },
// };

// export const Heading = {
//   args: {},
//   play: async ({ canvas }) => {
//     await expect(canvas.getByText(/PlayerAvatar/gi)).toBeTruthy();
//   },
// } satisfies Story;
