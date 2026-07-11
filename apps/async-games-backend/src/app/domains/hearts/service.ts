import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';

import { chooseCardsToPass, chooseCardToPlay } from './hearts.bot';
import {
  createGame,
  finishGame,
  isGameOver,
  isRoundComplete,
  isTrickComplete,
  playCard,
  resolveTrick,
  scoreRound,
  setPendingPass,
  startNextRound,
} from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import { validatePass, validatePlay, validateTrickAck } from './hearts.validator';
import { buildGameView, type HeartsGameView } from './hearts.view';
import { SEATS, type CardRef, type SeatIndex } from './hearts.interface';
import { HeartsStore } from './store';

const HUMAN_SEAT: SeatIndex = 0;
const toSeat = (value: number): SeatIndex => value as SeatIndex;

@Injectable()
export class HeartsService {
  constructor(private readonly store: HeartsStore) {}

  createGame(humanName: string, seed?: number): HeartsGameView {
    const game = createGame({
      gameId: `hearts_${randomUUID()}`,
      humanName,
      seed: seed ?? Math.floor(Math.random() * 0x7fffffff),
    });
    this.beginRound(game);
    this.store.save(game);
    return this.view(game);
  }

  getGame(gameId: string, viewerSeat: SeatIndex = HUMAN_SEAT): HeartsGameView {
    return this.view(this.store.get(gameId), viewerSeat);
  }

  passCards(gameId: string, seat: number, cards: CardRef[]): HeartsGameView {
    const game = this.store.get(gameId);
    const seatIndex = toSeat(seat);
    validatePass(game, seatIndex, cards);
    // Bots have already pre-selected their passes (see beginRound); the human's
    // selection completes the set and triggers the exchange.
    setPendingPass(game, seatIndex, cards);
    this.autoPlayBots(game);
    return this.view(game);
  }

  playCard(gameId: string, seat: number, card: CardRef): HeartsGameView {
    const game = this.store.get(gameId);
    const seatIndex = toSeat(seat);
    validatePlay(game, seatIndex, card);
    playCard(game, seatIndex, card);
    this.autoPlayBots(game);
    return this.view(game);
  }

  /**
   * Resolves the completed trick the human has acknowledged, then plays bots on
   * until the next human decision or the next completed trick. This is the pause
   * point that lets the player see every trick before it is swept away.
   */
  advanceTrick(gameId: string): HeartsGameView {
    const game = this.store.get(gameId);
    validateTrickAck(game);
    resolveTrick(game);
    this.settleRound(game);
    this.autoPlayBots(game);
    return this.view(game);
  }

  deleteGame(gameId: string): void {
    this.store.delete(gameId);
  }

  private view(
    game: HeartsGame,
    viewerSeat: SeatIndex = HUMAN_SEAT
  ): HeartsGameView {
    return buildGameView(game, viewerSeat);
  }

  /** Prepares a freshly dealt round: bots pre-select their passes. */
  private beginRound(game: HeartsGame): void {
    if (game.phase === 'passing') {
      SEATS.filter((seat) => game.players[seat].isBot).forEach((seat) => {
        game.pendingPasses[seat] = chooseCardsToPass(game, seat);
      });
    }
  }

  /** Scores/advances the round once its final trick has been resolved. */
  private settleRound(game: HeartsGame): void {
    if (!isRoundComplete(game)) return;

    scoreRound(game);
    if (isGameOver(game)) {
      finishGame(game);
      return;
    }
    startNextRound(game);
    this.beginRound(game);
  }

  /**
   * Plays out bot turns until it is the human's turn, a trick completes (so the
   * human can acknowledge it), or the game otherwise pauses. Tricks are NOT
   * resolved here — resolution waits for the human's advanceTrick.
   */
  private autoPlayBots(game: HeartsGame): void {
    while (
      game.phase === 'playing' &&
      !isTrickComplete(game) &&
      game.players[game.currentTurn].isBot
    ) {
      const seat = game.currentTurn;
      playCard(game, seat, chooseCardToPlay(game, seat));
    }
  }
}
