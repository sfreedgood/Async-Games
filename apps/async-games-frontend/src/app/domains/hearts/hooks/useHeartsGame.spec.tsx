import { act, renderHook, waitFor } from '@testing-library/react';
import { postData, getData } from '../../../../api';
import { useHeartsGame } from './useHeartsGame';
import { mockGameView } from '../entities';

// jest.mock is hoisted above the imports by babel-jest regardless of position.
jest.mock('../../../../api', () => ({
  postData: jest.fn(),
  getData: jest.fn(),
}));

const postMock = postData as jest.Mock;
const getMock = getData as jest.Mock;

describe('useHeartsGame', () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
  });

  it('creates a game on mount and exposes the view', async () => {
    const created = mockGameView();
    postMock.mockResolvedValueOnce(created);

    const { result } = renderHook(() => useHeartsGame('You'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.view?.gameId).toBe('mock-game');
    expect(postMock).toHaveBeenCalledWith('/hearts/games', {
      humanName: 'You',
      seed: undefined,
    });
  });

  it('replaces the view with the response of a play', async () => {
    const created = mockGameView();
    const afterPlay = mockGameView({ currentTurn: 2, heartsBroken: true });
    postMock.mockResolvedValueOnce(created).mockResolvedValueOnce(afterPlay);

    const { result } = renderHook(() => useHeartsGame('You'));
    await waitFor(() => expect(result.current.view).not.toBeNull());

    await act(async () => {
      await result.current.playCard({ name: '2', suit: 'club' });
    });

    expect(postMock).toHaveBeenLastCalledWith('/hearts/games/mock-game/play', {
      seat: 0,
      card: { name: '2', suit: 'club' },
    });
    expect(result.current.view?.heartsBroken).toBe(true);
  });

  it('advances the trick and replaces the view with the response', async () => {
    const created = mockGameView({ awaitingTrickAck: true });
    const afterAdvance = mockGameView({ currentTurn: 1, awaitingTrickAck: false });
    postMock.mockResolvedValueOnce(created).mockResolvedValueOnce(afterAdvance);

    const { result } = renderHook(() => useHeartsGame('You'));
    await waitFor(() => expect(result.current.view).not.toBeNull());

    await act(async () => {
      await result.current.advanceTrick();
    });

    expect(postMock).toHaveBeenLastCalledWith(
      '/hearts/games/mock-game/advance',
      {}
    );
    expect(result.current.view?.awaitingTrickAck).toBe(false);
    expect(result.current.view?.currentTurn).toBe(1);
  });

  it('surfaces an error and refetches when a move is rejected', async () => {
    const created = mockGameView();
    postMock
      .mockResolvedValueOnce(created)
      .mockRejectedValueOnce(new Error('422'));
    getMock.mockResolvedValueOnce(mockGameView({ currentTurn: 0 }));

    const { result } = renderHook(() => useHeartsGame('You'));
    await waitFor(() => expect(result.current.view).not.toBeNull());

    await act(async () => {
      await result.current.playCard({ name: 'A', suit: 'heart' });
    });

    expect(result.current.error).toBe('That move was not allowed.');
    expect(getMock).toHaveBeenCalledWith('/hearts/games/mock-game');
  });
});
