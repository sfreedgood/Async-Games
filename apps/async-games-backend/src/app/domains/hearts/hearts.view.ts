import { getLegalMoves, isTrickComplete, trickWinner } from './hearts.engine';
import type { CompletedTrick, HeartsGame } from './hearts.entity';
import type {
  CardRef,
  GamePhase,
  HeartsSuit,
  PassDirection,
  SeatIndex,
} from './hearts.interface';

export interface HeartsPlayerView {
  seat: SeatIndex;
  name: string;
  isBot: boolean;
  handCount: number;
  totalScore: number;
  roundScore: number;
}

export interface TrickPlayView {
  seat: SeatIndex;
  card: CardRef;
}

export interface TrickView {
  leadSuit: HeartsSuit | null;
  plays: TrickPlayView[];
}

/**
 * The authoritative, per-viewer projection of a game. Opponent hands are
 * hidden (counts only); the viewer's own hand and currently legal moves are
 * exposed so the client can render and disable cards. This is the exact JSON
 * contract the frontend mirrors.
 */
export interface HeartsGameView {
  gameId: string;
  phase: GamePhase;
  roundNumber: number;
  passDirection: PassDirection;
  heartsBroken: boolean;
  viewerSeat: SeatIndex;
  currentTurn: SeatIndex;
  trickLeader: SeatIndex;
  players: HeartsPlayerView[];
  yourHand: CardRef[];
  legalMoves: CardRef[];
  pendingPassCount: number;
  currentTrick: TrickView;
  /** True when the current trick is complete and awaiting the human's "continue". */
  awaitingTrickAck: boolean;
  /** Seat that will take the completed trick, while awaiting acknowledgement. */
  pendingTrickWinner: SeatIndex | null;
  lastTrick: CompletedTrick | null;
  winnerSeat: SeatIndex | null;
}

export const buildGameView = (
  game: HeartsGame,
  viewerSeat: SeatIndex
): HeartsGameView => {
  const trickComplete = game.phase === 'playing' && isTrickComplete(game);
  return {
  gameId: game.gameId,
  phase: game.phase,
  roundNumber: game.roundNumber,
  passDirection: game.passDirection,
  heartsBroken: game.heartsBroken,
  viewerSeat,
  currentTurn: game.currentTurn,
  trickLeader: game.trickLeader,
  players: game.players.map((p) => ({
    seat: p.seat,
    name: p.name,
    isBot: p.isBot,
    handCount: game.hands[p.seat].length,
    totalScore: game.totalScores[p.seat],
    roundScore: game.roundScores[p.seat],
  })),
  yourHand: game.hands[viewerSeat].slice(),
  legalMoves: getLegalMoves(game, viewerSeat),
  pendingPassCount: game.pendingPasses[viewerSeat].length,
  currentTrick: {
    leadSuit: game.currentTrick.leadSuit,
    plays: game.currentTrick.plays.map((p) => ({ seat: p.seat, card: p.card })),
  },
  awaitingTrickAck: trickComplete,
  pendingTrickWinner:
    trickComplete && game.currentTrick.leadSuit !== null
      ? trickWinner(game.currentTrick.plays, game.currentTrick.leadSuit)
      : null,
  lastTrick: game.lastTrick,
  winnerSeat: game.winnerSeat,
  };
};
