import { fireEvent, render, screen, within } from '@testing-library/react';
import { HeartsTable } from './HeartsTable';
import { mockGameView } from '../entities';

const noop = () => undefined;

// Disabled/visual state is covered by snapshots; these specs assert behaviour
// via Testing Library queries (the spec tsconfig excludes the DOM lib, so we
// avoid reading raw element properties like .disabled / .textContent).
describe('HeartsTable', () => {
  it('plays a legal card on click', () => {
    const onPlay = jest.fn();
    render(<HeartsTable view={mockGameView()} onPlay={onPlay} onPass={noop} />);
    fireEvent.click(screen.getByRole('button', { name: '2 of club' }));
    expect(onPlay).toHaveBeenCalledWith({ name: '2', suit: 'club' });
  });

  it('does not play an illegal (disabled) card', () => {
    const onPlay = jest.fn();
    render(<HeartsTable view={mockGameView()} onPlay={onPlay} onPass={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'A of heart' }));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('shows whose turn it is when waiting on an opponent', () => {
    render(
      <HeartsTable
        view={mockGameView({ currentTurn: 2, legalMoves: [] })}
        onPlay={noop}
        onPass={noop}
      />
    );
    expect(screen.getByText(/Waiting for North/)).toBeTruthy();
  });

  it('passes exactly three cards once three are selected', () => {
    const onPass = jest.fn();
    render(
      <HeartsTable
        view={mockGameView({
          phase: 'passing',
          legalMoves: [],
          currentTrick: { leadSuit: null, plays: [] },
        })}
        onPlay={noop}
        onPass={onPass}
      />
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
    render(
      <HeartsTable
        view={mockGameView({
          phase: 'passing',
          legalMoves: [],
          currentTrick: { leadSuit: null, plays: [] },
        })}
        onPlay={noop}
        onPass={onPass}
      />
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
    render(
      <HeartsTable
        view={mockGameView({
          phase: 'finished',
          winnerSeat: 0,
          legalMoves: [],
          currentTrick: { leadSuit: null, plays: [] },
        })}
        onPlay={noop}
        onPass={noop}
      />
    );
    const banner = screen.getByTestId('game-over');
    expect(within(banner).getByText('Game over')).toBeTruthy();
    expect(within(banner).getByText(/wins!/)).toBeTruthy();
  });
});
