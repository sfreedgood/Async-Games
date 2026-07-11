import { fireEvent, render, screen, within } from '@testing-library/react';
import { HeartsTable } from './HeartsTable';
import type { HeartsTableProps } from './HeartsTable';
import { mockGameView } from '../entities';
import type { HeartsGameView } from '../entities';

const noop = () => undefined;

const renderTable = (
  view: HeartsGameView,
  // Reuse the component's own handler prop types so the test signatures can't
  // drift from HeartsTable (the previous `never` params broke typecheck).
  handlers: Partial<
    Pick<HeartsTableProps, 'onPlay' | 'onPass' | 'onContinue'>
  > = {}
) =>
  render(
    <HeartsTable
      view={view}
      onPlay={handlers.onPlay ?? noop}
      onPass={handlers.onPass ?? noop}
      onContinue={handlers.onContinue ?? noop}
    />
  );

// Disabled/visual state is covered by snapshots; these specs assert behaviour
// via Testing Library queries (the spec tsconfig excludes the DOM lib, so we
// avoid reading raw element properties like .disabled / .textContent).
describe('HeartsTable', () => {
  it('plays a legal card on click', () => {
    const onPlay = jest.fn();
    renderTable(mockGameView(), { onPlay });
    fireEvent.click(screen.getByRole('button', { name: '2 of club' }));
    expect(onPlay).toHaveBeenCalledWith({ name: '2', suit: 'club' });
  });

  it('does not play an illegal (disabled) card', () => {
    const onPlay = jest.fn();
    renderTable(mockGameView(), { onPlay });
    fireEvent.click(screen.getByRole('button', { name: 'A of heart' }));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('shows whose turn it is when waiting on an opponent', () => {
    renderTable(mockGameView({ currentTurn: 2, legalMoves: [] }));
    expect(screen.getByText(/Waiting for North/)).toBeTruthy();
  });

  it('shows a continue prompt and button when a trick is complete', () => {
    const onContinue = jest.fn();
    renderTable(
      mockGameView({
        currentTurn: 1,
        legalMoves: [],
        awaitingTrickAck: true,
        pendingTrickWinner: 2,
        currentTrick: {
          leadSuit: 'club',
          plays: [
            { seat: 3, card: { name: '7', suit: 'club' } },
            { seat: 0, card: { name: '5', suit: 'club' } },
            { seat: 1, card: { name: 'K', suit: 'club' } },
            { seat: 2, card: { name: 'A', suit: 'club' } },
          ],
        },
      }),
      { onContinue }
    );
    expect(screen.getByText(/North takes the trick/)).toBeTruthy();
    fireEvent.click(screen.getByTestId('continue-button'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('does not play a card while awaiting trick acknowledgement', () => {
    const onPlay = jest.fn();
    renderTable(
      mockGameView({
        currentTurn: 0,
        legalMoves: [],
        awaitingTrickAck: true,
        pendingTrickWinner: 0,
        currentTrick: {
          leadSuit: 'club',
          plays: [
            { seat: 1, card: { name: '7', suit: 'club' } },
            { seat: 2, card: { name: '10', suit: 'club' } },
            { seat: 3, card: { name: '8', suit: 'club' } },
            { seat: 0, card: { name: 'J', suit: 'club' } },
          ],
        },
      }),
      { onPlay }
    );
    // Scope to the hand: the trick area also renders cards as buttons.
    const hand = within(screen.getByTestId('local-hand'));
    fireEvent.click(hand.getByRole('button', { name: '2 of club' }));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('shows the local round score on the player badge', () => {
    renderTable(mockGameView());
    // mock local player has roundScore 4.
    expect(screen.getByText(/4 pts this round/)).toBeTruthy();
  });

  it('passes exactly three cards once three are selected', () => {
    const onPass = jest.fn();
    renderTable(
      mockGameView({
        phase: 'passing',
        legalMoves: [],
        currentTrick: { leadSuit: null, plays: [] },
      }),
      { onPass }
    );

    const passButton = screen.getByTestId('pass-button');
    // Disabled until three are chosen: clicking does nothing.
    fireEvent.click(passButton);
    expect(onPass).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '2 of club' }));
    fireEvent.click(screen.getByRole('button', { name: '5 of club' }));
    fireEvent.click(screen.getByRole('button', { name: '9 of club' }));

    fireEvent.click(passButton);
    expect(onPass).toHaveBeenCalledTimes(1);
    expect(onPass.mock.calls[0][0]).toHaveLength(3);
  });

  it('caps pass selection at three cards', () => {
    const onPass = jest.fn();
    renderTable(
      mockGameView({
        phase: 'passing',
        legalMoves: [],
        currentTrick: { leadSuit: null, plays: [] },
      }),
      { onPass }
    );
    ['2 of club', '5 of club', '9 of club', '4 of diamond'].forEach((name) =>
      fireEvent.click(screen.getByRole('button', { name }))
    );
    // A fourth selection is ignored — the counter stays at 3/3.
    expect(screen.getByText(/3\/3 selected/)).toBeTruthy();
    fireEvent.click(screen.getByTestId('pass-button'));
    expect(onPass.mock.calls[0][0]).toHaveLength(3);
  });

  it('renders the game-over banner with the winner when finished', () => {
    renderTable(
      mockGameView({
        phase: 'finished',
        winnerSeat: 0,
        legalMoves: [],
        currentTrick: { leadSuit: null, plays: [] },
      })
    );
    const banner = screen.getByTestId('game-over');
    expect(within(banner).getByText('Game over')).toBeTruthy();
    expect(within(banner).getByText(/wins!/)).toBeTruthy();
  });
});
