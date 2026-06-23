import { fireEvent, render, screen } from '@testing-library/react';
import { HeartsTable } from './HeartsTable';
import { mockGameView } from '../entities';

const noop = () => undefined;

describe('HeartsTable', () => {
  it('plays a legal card on click', () => {
    const onPlay = jest.fn();
    render(
      <HeartsTable view={mockGameView()} onPlay={onPlay} onPass={noop} />
    );
    fireEvent.click(screen.getByRole('button', { name: '2 of club' }));
    expect(onPlay).toHaveBeenCalledWith({ name: '2', suit: 'club' });
  });

  it('disables illegal cards so they cannot be played', () => {
    const onPlay = jest.fn();
    render(
      <HeartsTable view={mockGameView()} onPlay={onPlay} onPass={noop} />
    );
    const illegal = screen.getByRole('button', { name: 'A of heart' });
    expect((illegal as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(illegal);
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
    expect(screen.getByTestId('turn-status').textContent).toContain(
      'Waiting for North'
    );
  });

  it('requires exactly three cards before passing is enabled', () => {
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

    const passButton = screen.getByTestId('pass-button') as HTMLButtonElement;
    expect(passButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '2 of club' }));
    fireEvent.click(screen.getByRole('button', { name: '5 of club' }));
    fireEvent.click(screen.getByRole('button', { name: '9 of club' }));

    expect(passButton.disabled).toBe(false);
    fireEvent.click(passButton);
    expect(onPass).toHaveBeenCalledTimes(1);
    expect(onPass.mock.calls[0][0]).toHaveLength(3);
  });

  it('caps pass selection at three cards', () => {
    render(
      <HeartsTable
        view={mockGameView({
          phase: 'passing',
          legalMoves: [],
          currentTrick: { leadSuit: null, plays: [] },
        })}
        onPlay={noop}
        onPass={noop}
      />
    );
    ['2 of club', '5 of club', '9 of club', '4 of diamond'].forEach((name) =>
      fireEvent.click(screen.getByRole('button', { name }))
    );
    expect(screen.getByTestId('pass-panel').textContent).toContain('3/3');
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
    expect(banner.textContent).toContain('Game over');
    expect(banner.textContent).toContain('You');
  });
});
