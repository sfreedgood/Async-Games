import {
  applyPasses,
  createGame,
  dealRound,
  finishGame,
  getLegalMoves,
  isGameOver,
  passDirectionForRound,
  passTargetSeat,
  playCard,
  resolveTrick,
  scoreRound,
  trickWinner,
} from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import {
  cardKey,
  SEATS,
  type CardRef,
  type HeartsCardName,
  type HeartsSuit,
  type SeatIndex,
} from './hearts.interface';

const c = (name: HeartsCardName, suit: HeartsSuit): CardRef => ({ name, suit });

const newGame = (seed = 1): HeartsGame =>
  createGame({ gameId: 'g1', humanName: 'You', seed });

describe('dealRound', () => {
  it('deals 13 cards to each of the four seats', () => {
    const game = newGame();
    SEATS.forEach((seat) => expect(game.hands[seat]).toHaveLength(13));
  });

  it('deals all 52 distinct cards with no jokers', () => {
    const game = newGame();
    const all = SEATS.flatMap((seat) => game.hands[seat]);
    expect(all).toHaveLength(52);
    expect(new Set(all.map(cardKey)).size).toBe(52);
    expect(all.some((card) => card.suit === ('joker' as HeartsSuit))).toBe(
      false
    );
  });

  it('is deterministic for the same seed', () => {
    expect(newGame(7).hands).toEqual(newGame(7).hands);
  });

  it('differs across seeds', () => {
    expect(newGame(7).hands).not.toEqual(newGame(8).hands);
  });

  it('opens the passing phase on a non-hold round', () => {
    const game = newGame();
    expect(game.passDirection).toBe('left');
    expect(game.phase).toBe('passing');
  });

  it('skips passing and starts play on a hold round', () => {
    const game = newGame();
    game.roundNumber = 3; // index 3 => 'hold'
    dealRound(game);
    expect(game.passDirection).toBe('hold');
    expect(game.phase).toBe('playing');
  });
});

describe('pass direction & targets', () => {
  it('rotates left, right, across, hold', () => {
    expect(passDirectionForRound(0)).toBe('left');
    expect(passDirectionForRound(1)).toBe('right');
    expect(passDirectionForRound(2)).toBe('across');
    expect(passDirectionForRound(3)).toBe('hold');
    expect(passDirectionForRound(4)).toBe('left');
  });

  it('maps seats to the correct recipient', () => {
    expect(passTargetSeat(0, 'left')).toBe(1);
    expect(passTargetSeat(0, 'across')).toBe(2);
    expect(passTargetSeat(0, 'right')).toBe(3);
    expect(passTargetSeat(2, 'hold')).toBe(2);
  });
});

describe('applyPasses', () => {
  it('moves the chosen cards to the target seat and starts play', () => {
    const game = newGame();
    const passed: Record<SeatIndex, CardRef[]> = {
      0: game.hands[0].slice(0, 3),
      1: game.hands[1].slice(0, 3),
      2: game.hands[2].slice(0, 3),
      3: game.hands[3].slice(0, 3),
    };
    SEATS.forEach((seat) => (game.pendingPasses[seat] = passed[seat]));

    applyPasses(game);

    // seat 0 passes left to seat 1
    passed[0].forEach((card) => {
      expect(game.hands[1].map(cardKey)).toContain(cardKey(card));
      expect(game.hands[0].map(cardKey)).not.toContain(cardKey(card));
    });
    SEATS.forEach((seat) => expect(game.hands[seat]).toHaveLength(13));
    expect(game.phase).toBe('playing');
  });
});

describe('getLegalMoves', () => {
  const playingGame = (handZero: CardRef[]): HeartsGame => {
    const game = newGame();
    game.phase = 'playing';
    game.tricksPlayed = 1; // not the first trick unless overridden
    game.heartsBroken = false;
    game.currentTrick = { leadSuit: null, plays: [] };
    game.currentTurn = 0;
    game.trickLeader = 0;
    game.hands[0] = handZero;
    return game;
  };

  it('forces the 2 of clubs to lead the first trick', () => {
    const game = playingGame([c('2', 'club'), c('A', 'spade'), c('5', 'heart')]);
    game.tricksPlayed = 0;
    expect(getLegalMoves(game, 0)).toEqual([c('2', 'club')]);
  });

  it('requires following the lead suit when able', () => {
    const game = playingGame([c('3', 'club'), c('9', 'club'), c('A', 'spade')]);
    game.currentTrick = {
      leadSuit: 'club',
      plays: [{ seat: 3, card: c('4', 'club') }],
    };
    game.currentTurn = 0;
    expect(getLegalMoves(game, 0)).toEqual([c('3', 'club'), c('9', 'club')]);
  });

  it('forbids leading hearts until hearts are broken', () => {
    const game = playingGame([c('5', 'heart'), c('8', 'club'), c('K', 'spade')]);
    expect(getLegalMoves(game, 0)).toEqual([c('8', 'club'), c('K', 'spade')]);
  });

  it('allows leading hearts once broken', () => {
    const game = playingGame([c('5', 'heart'), c('8', 'club')]);
    game.heartsBroken = true;
    expect(getLegalMoves(game, 0)).toEqual([c('5', 'heart'), c('8', 'club')]);
  });

  it('allows leading hearts when the hand is all hearts', () => {
    const game = playingGame([c('5', 'heart'), c('J', 'heart')]);
    expect(getLegalMoves(game, 0)).toEqual([c('5', 'heart'), c('J', 'heart')]);
  });

  it('bans points on the first trick when void in the lead suit', () => {
    const game = playingGame([c('Q', 'spade'), c('3', 'heart'), c('9', 'diamond')]);
    game.tricksPlayed = 0;
    game.currentTrick = {
      leadSuit: 'club',
      plays: [{ seat: 3, card: c('2', 'club') }],
    };
    game.currentTurn = 0;
    expect(getLegalMoves(game, 0)).toEqual([c('9', 'diamond')]);
  });

  it('returns nothing when it is not the seat’s turn', () => {
    const game = playingGame([c('8', 'club')]);
    game.currentTurn = 2;
    expect(getLegalMoves(game, 0)).toEqual([]);
  });
});

describe('trickWinner & resolveTrick', () => {
  it('awards the trick to the highest card of the lead suit, ignoring off-suit', () => {
    const plays = [
      { seat: 0 as SeatIndex, card: c('4', 'club') },
      { seat: 1 as SeatIndex, card: c('K', 'club') },
      { seat: 2 as SeatIndex, card: c('A', 'spade') }, // off-suit, cannot win
      { seat: 3 as SeatIndex, card: c('2', 'club') },
    ];
    expect(trickWinner(plays, 'club')).toBe(1);
  });

  it('gives the trick cards to the winner and makes them lead next', () => {
    const game = newGame();
    game.phase = 'playing';
    game.currentTrick = {
      leadSuit: 'heart',
      plays: [
        { seat: 0, card: c('3', 'heart') },
        { seat: 1, card: c('Q', 'heart') },
        { seat: 2, card: c('2', 'heart') },
        { seat: 3, card: c('5', 'heart') },
      ],
    };
    const winner = resolveTrick(game);
    expect(winner).toBe(1);
    expect(game.tricksTaken[1]).toHaveLength(4);
    expect(game.trickLeader).toBe(1);
    expect(game.currentTurn).toBe(1);
    expect(game.tricksPlayed).toBe(1);
    expect(game.lastTrick?.winnerSeat).toBe(1);
  });

  it('accumulates the running round score as tricks are taken', () => {
    const game = newGame();
    game.phase = 'playing';
    game.currentTrick = {
      leadSuit: 'heart',
      plays: [
        { seat: 0, card: c('3', 'heart') },
        { seat: 1, card: c('Q', 'heart') },
        { seat: 2, card: c('2', 'heart') },
        { seat: 3, card: c('5', 'heart') },
      ],
    };
    resolveTrick(game);
    // Winner (seat 1) took four hearts this trick: 4 running points, mid-round.
    expect(game.roundScores[1]).toBe(4);
    expect(game.roundScores[0]).toBe(0);
  });
});

describe('playCard', () => {
  it('sets the lead suit, breaks hearts, and advances the turn', () => {
    const game = newGame();
    game.phase = 'playing';
    game.currentTrick = { leadSuit: null, plays: [] };
    game.currentTurn = 2;
    game.hands[2] = [c('7', 'heart'), c('3', 'club')];

    playCard(game, 2, c('7', 'heart'));

    expect(game.currentTrick.leadSuit).toBe('heart');
    expect(game.heartsBroken).toBe(true);
    expect(game.currentTurn).toBe(3);
    expect(game.hands[2]).toEqual([c('3', 'club')]);
  });
});

describe('scoreRound', () => {
  it('scores 1 per heart and 13 for the queen of spades', () => {
    const game = newGame();
    game.tricksTaken[1] = [c('2', 'heart'), c('9', 'heart')];
    game.tricksTaken[2] = [c('Q', 'spade')];
    scoreRound(game);
    expect(game.roundScores[1]).toBe(2);
    expect(game.roundScores[2]).toBe(13);
    expect(game.totalScores[1]).toBe(2);
    expect(game.phase).toBe('round-scoring');
  });

  it('applies shoot-the-moon: shooter scores 0, everyone else 26', () => {
    const game = newGame();
    const hearts = (['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as HeartsCardName[]).map(
      (name) => c(name, 'heart')
    );
    game.tricksTaken[0] = [...hearts, c('Q', 'spade')];
    scoreRound(game);
    expect(game.roundScores[0]).toBe(0);
    expect(game.roundScores[1]).toBe(26);
    expect(game.roundScores[2]).toBe(26);
    expect(game.roundScores[3]).toBe(26);
  });
});

describe('game end', () => {
  it('detects game over once a seat reaches 100', () => {
    const game = newGame();
    game.totalScores = { 0: 100, 1: 40, 2: 55, 3: 12 };
    expect(isGameOver(game)).toBe(true);
  });

  it('declares the lowest total score the winner', () => {
    const game = newGame();
    game.totalScores = { 0: 100, 1: 40, 2: 55, 3: 12 };
    finishGame(game);
    expect(game.winnerSeat).toBe(3);
    expect(game.phase).toBe('finished');
  });
});
