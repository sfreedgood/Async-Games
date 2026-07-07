import axios from 'axios';

type CardRef = { name: string; suit: string };
type GameView = {
  gameId: string;
  phase: string;
  currentTurn: number;
  yourHand: CardRef[];
  legalMoves: CardRef[];
  awaitingTrickAck: boolean;
  pendingTrickWinner: number | null;
  players: {
    seat: number;
    handCount: number;
    totalScore: number;
    roundScore: number;
  }[];
  currentTrick: { plays: { seat: number; card: CardRef }[] };
};

describe('Hearts API', () => {
  it('creates a game, passes, and plays a card through to the human turn', async () => {
    const created = await axios.post<GameView>('/api/hearts/games', {
      humanName: 'E2E',
      seed: 4242,
    });
    expect(created.status).toBe(201);
    expect(created.data.phase).toBe('passing');
    expect(created.data.yourHand).toHaveLength(13);
    expect(created.data.players).toHaveLength(4);

    const gameId = created.data.gameId;
    const passed = await axios.post<GameView>(
      `/api/hearts/games/${gameId}/pass`,
      { seat: 0, cards: created.data.yourHand.slice(0, 3) }
    );
    expect(passed.data.phase).toBe('playing');
    expect(passed.data.currentTurn).toBe(0);
    expect(passed.data.legalMoves.length).toBeGreaterThan(0);

    const handBefore = passed.data.players[0].handCount;
    const played = await axios.post<GameView>(
      `/api/hearts/games/${gameId}/play`,
      { seat: 0, card: passed.data.legalMoves[0] }
    );
    expect(played.data.players[0].handCount).toBe(handBefore - 1);

    // The completed trick pauses for acknowledgement before it is swept.
    expect(played.data.awaitingTrickAck).toBe(true);
    expect(played.data.currentTrick.plays).toHaveLength(4);
    expect(played.data.pendingTrickWinner).not.toBeNull();

    const advanced = await axios.post<GameView>(
      `/api/hearts/games/${gameId}/advance`
    );
    expect(advanced.data.awaitingTrickAck).toBe(false);
    expect(advanced.data.currentTrick.plays.length).toBeLessThan(4);

    await axios.delete(`/api/hearts/games/${gameId}`);
  });

  it('rejects an illegal move with 422', async () => {
    const created = await axios.post<GameView>('/api/hearts/games', {
      humanName: 'E2E',
      seed: 99,
    });
    const gameId = created.data.gameId;
    await axios.post(`/api/hearts/games/${gameId}/pass`, {
      seat: 0,
      cards: created.data.yourHand.slice(0, 3),
    });

    // After the pass it is the human's turn (seat 0). A play from a bot seat is
    // out of turn -> 422, independent of the dealt hands.
    const outOfTurn = { seat: 1, card: { name: 'A', suit: 'heart' } };
    await expect(
      axios.post(`/api/hearts/games/${gameId}/play`, outOfTurn)
    ).rejects.toMatchObject({ response: { status: 422 } });

    await axios.delete(`/api/hearts/games/${gameId}`);
  });

  it('rejects a malformed request body with 400', async () => {
    await expect(
      axios.post('/api/hearts/games', { seed: 'not-a-number' })
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('returns 404 for an unknown game', async () => {
    await expect(
      axios.get('/api/hearts/games/does-not-exist')
    ).rejects.toMatchObject({ response: { status: 404 } });
  });
});
