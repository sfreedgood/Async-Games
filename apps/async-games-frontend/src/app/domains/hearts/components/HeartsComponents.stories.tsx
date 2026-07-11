import { Meta, StoryObj } from '@storybook/react-vite';
import { TrickArea } from './TrickArea';
import { Scoreboard } from './Scoreboard';
import { PassPhasePanel } from './PassPhasePanel';
import { OpponentHand } from './OpponentHand';
import { mockGameView } from '../entities';

const view = mockGameView();

export default {
  title: 'Domains/Hearts/Components',
} satisfies Meta;

export const Trick: StoryObj = {
  render: () => (
    <TrickArea
      trick={{
        leadSuit: 'club',
        plays: [
          { seat: 0, card: { name: '5', suit: 'club' } },
          { seat: 1, card: { name: 'K', suit: 'club' } },
          { seat: 2, card: { name: '2', suit: 'club' } },
          { seat: 3, card: { name: '7', suit: 'club' } },
        ],
      }}
      players={view.players}
    />
  ),
};

export const TrickWithWinner: StoryObj = {
  render: () => (
    <TrickArea
      trick={{
        leadSuit: 'club',
        plays: [
          { seat: 0, card: { name: '5', suit: 'club' } },
          { seat: 1, card: { name: 'K', suit: 'club' } },
          { seat: 2, card: { name: '2', suit: 'club' } },
          { seat: 3, card: { name: '7', suit: 'club' } },
        ],
      }}
      players={view.players}
      winnerSeat={1}
    />
  ),
};

export const Scores: StoryObj = {
  render: () => (
    <Scoreboard players={view.players} currentTurn={0} roundNumber={2} />
  ),
};

export const PassPrompt: StoryObj = {
  render: () => (
    <PassPhasePanel
      direction="left"
      selectedCount={2}
      required={3}
      onSubmit={() => undefined}
    />
  ),
};

export const Opponent: StoryObj = {
  render: () => <OpponentHand count={13} />,
};
