import { Meta, StoryObj } from '@storybook/react-vite';
import { HeartsTable } from './HeartsTable';
import { mockGameView } from '../entities';

export default {
  title: 'Domains/Hearts/HeartsTable',
  component: HeartsTable,
  parameters: { layout: 'fullscreen' },
  args: {
    onPlay: () => undefined,
    onPass: () => undefined,
  },
} satisfies Meta<typeof HeartsTable>;

type Story = StoryObj<typeof HeartsTable>;

export const YourTurn = {
  args: { view: mockGameView() },
} satisfies Story;

export const WaitingOnOpponent = {
  args: {
    view: mockGameView({
      currentTurn: 2,
      legalMoves: [],
      currentTrick: {
        leadSuit: 'club',
        plays: [
          { seat: 0, card: { name: '5', suit: 'club' } },
          { seat: 1, card: { name: 'K', suit: 'club' } },
        ],
      },
    }),
  },
} satisfies Story;

export const PassingPhase = {
  args: {
    view: mockGameView({
      phase: 'passing',
      legalMoves: [],
      currentTrick: { leadSuit: null, plays: [] },
    }),
  },
} satisfies Story;

export const Finished = {
  args: {
    view: mockGameView({
      phase: 'finished',
      winnerSeat: 0,
      legalMoves: [],
      currentTrick: { leadSuit: null, plays: [] },
    }),
  },
} satisfies Story;
