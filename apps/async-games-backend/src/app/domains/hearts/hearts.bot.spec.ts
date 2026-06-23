import { chooseCardsToPass, chooseCardToPlay } from './hearts.bot';
import {
  applyPasses,
  createGame,
  getLegalMoves,
  isRoundComplete,
  isTrickComplete,
  playCard,
  resolveTrick,
  scoreRound,
} from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import {
  cardKey,
  CARDS_TO_PASS,
  SEATS,
  SHOOT_THE_MOON_POINTS,
  type SeatIndex,
} from './hearts.interface';

const newGame = (seed = 1): HeartsGame =>
  createGame({ gameId: 'g1', humanName: 'You', seed });

/** Drives all four bot seats through the pass and play of one full round. */
const playRoundWithBots = (game: HeartsGame): void => {
  if (game.phase === 'passing') {
    SEATS.forEach((seat) =>
      (game.pendingPasses[seat] = chooseCardsToPass(game, seat))
    );
    applyPasses(game);
  }

  while (!isRoundComplete(game)) {
    const seat = game.currentTurn;
    const card = chooseCardToPlay(game, seat);
    // Every bot choice must be legal.
    expect(getLegalMoves(game, seat).map(cardKey)).toContain(cardKey(card));
    playCard(game, seat, card);
    if (isTrickComplete(game)) resolveTrick(game);
  }
  scoreRound(game);
};

describe('chooseCardsToPass', () => {
  it('passes exactly three cards from the hand', () => {
    const game = newGame();
    const passed = chooseCardsToPass(game, 0);
    expect(passed).toHaveLength(CARDS_TO_PASS);
    const handKeys = game.hands[0].map(cardKey);
    passed.forEach((card) => expect(handKeys).toContain(cardKey(card)));
  });

  it('is deterministic for the same seed', () => {
    expect(chooseCardsToPass(newGame(3), 0)).toEqual(
      chooseCardsToPass(newGame(3), 0)
    );
  });
});

describe('chooseCardToPlay', () => {
  it('always returns a legal move for every seat across a full round', () => {
    // The assertions live inside playRoundWithBots.
    expect(() => playRoundWithBots(newGame(42))).not.toThrow();
  });

  it('is deterministic: same seed yields identical round scores', () => {
    const a = newGame(99);
    const b = newGame(99);
    playRoundWithBots(a);
    playRoundWithBots(b);
    expect(a.roundScores).toEqual(b.roundScores);
  });
});

describe('full round integrity', () => {
  it('plays 13 tricks and distributes exactly 26 points', () => {
    const game = newGame(2024);
    playRoundWithBots(game);
    expect(game.tricksPlayed).toBe(13);
    const total = SEATS.reduce((sum, seat) => sum + game.roundScores[seat], 0);
    // 26 normally; shoot-the-moon makes it 78 (three seats at 26).
    expect([SHOOT_THE_MOON_POINTS, SHOOT_THE_MOON_POINTS * 3]).toContain(total);
  });

  it('empties every hand by the end of the round', () => {
    const game = newGame(2024);
    playRoundWithBots(game);
    SEATS.forEach((seat: SeatIndex) =>
      expect(game.hands[seat]).toHaveLength(0)
    );
  });
});
