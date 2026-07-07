import { HttpStatus } from '@nestjs/common';
import { EntityValidationError } from '../../../utils/error.utils';
import { createGame } from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import {
  validatePass,
  validatePlay,
  validateTrickAck,
} from './hearts.validator';
import type { CardRef, HeartsCardName, HeartsSuit } from './hearts.interface';

const c = (name: HeartsCardName, suit: HeartsSuit): CardRef => ({ name, suit });

const playingGame = (): HeartsGame => {
  const game = createGame({ gameId: 'g', humanName: 'You', seed: 1 });
  game.phase = 'playing';
  game.tricksPlayed = 1;
  game.heartsBroken = true;
  game.currentTrick = { leadSuit: null, plays: [] };
  game.currentTurn = 0;
  game.hands[0] = [c('5', 'club'), c('K', 'spade'), c('9', 'heart')];
  return game;
};

const expect422 = (fn: () => void) => {
  expect(fn).toThrow(EntityValidationError);
  try {
    fn();
  } catch (err) {
    expect((err as EntityValidationError).getStatus()).toBe(
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
};

describe('validatePlay', () => {
  it('accepts a legal play', () => {
    const game = playingGame();
    expect(() => validatePlay(game, 0, c('5', 'club'))).not.toThrow();
  });

  it('rejects playing out of turn (422)', () => {
    const game = playingGame();
    game.currentTurn = 2;
    expect422(() => validatePlay(game, 0, c('5', 'club')));
  });

  it('rejects a card not in hand (422)', () => {
    const game = playingGame();
    expect422(() => validatePlay(game, 0, c('2', 'diamond')));
  });

  it('rejects playing in the wrong phase (422)', () => {
    const game = playingGame();
    game.phase = 'passing';
    expect422(() => validatePlay(game, 0, c('5', 'club')));
  });

  it('rejects an illegal follow when able to follow suit (422)', () => {
    const game = playingGame();
    game.currentTrick = {
      leadSuit: 'club',
      plays: [{ seat: 3, card: c('2', 'club') }],
    };
    // Holds a club (5♣) so must follow; playing a spade is illegal.
    expect422(() => validatePlay(game, 0, c('K', 'spade')));
  });
});

describe('validateTrickAck', () => {
  it('accepts advancing once the trick is complete', () => {
    const game = playingGame();
    game.currentTrick = {
      leadSuit: 'club',
      plays: [
        { seat: 0, card: c('5', 'club') },
        { seat: 1, card: c('K', 'club') },
        { seat: 2, card: c('2', 'club') },
        { seat: 3, card: c('7', 'club') },
      ],
    };
    expect(() => validateTrickAck(game)).not.toThrow();
  });

  it('rejects advancing when the trick is incomplete (422)', () => {
    const game = playingGame();
    game.currentTrick = {
      leadSuit: 'club',
      plays: [{ seat: 0, card: c('5', 'club') }],
    };
    expect422(() => validateTrickAck(game));
  });

  it('rejects advancing outside the playing phase (422)', () => {
    const game = playingGame();
    game.phase = 'passing';
    expect422(() => validateTrickAck(game));
  });
});

describe('validatePass', () => {
  it('accepts three distinct cards from hand during passing', () => {
    const game = createGame({ gameId: 'g', humanName: 'You', seed: 1 });
    const cards = game.hands[0].slice(0, 3);
    expect(() => validatePass(game, 0, cards)).not.toThrow();
  });

  it('rejects passing in the wrong phase (422)', () => {
    const game = playingGame();
    expect422(() => validatePass(game, 0, game.hands[0].slice(0, 3)));
  });

  it('rejects a pass card not in hand (422)', () => {
    const game = createGame({ gameId: 'g', humanName: 'You', seed: 1 });
    const notHeld = game.hands[1].slice(0, 3); // other seat's cards
    expect422(() => validatePass(game, 0, notHeld));
  });

  it('rejects duplicate cards in a pass (422)', () => {
    const game = createGame({ gameId: 'g', humanName: 'You', seed: 1 });
    const card = game.hands[0][0];
    expect422(() => validatePass(game, 0, [card, card, card]));
  });
});
