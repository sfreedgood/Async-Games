import type { ClassicCardName, ClassicCardSuit } from '../../classic-card';

/** Value-based card identity, mirroring the backend CardRef. */
export interface CardRef {
  name: ClassicCardName;
  suit: ClassicCardSuit;
}

export type SeatIndex = 0 | 1 | 2 | 3;
export type GamePhase = 'passing' | 'playing' | 'round-scoring' | 'finished';
export type PassDirection = 'left' | 'right' | 'across' | 'hold';

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
  leadSuit: ClassicCardSuit | null;
  plays: TrickPlayView[];
}

export interface CompletedTrickView {
  winnerSeat: SeatIndex;
  plays: TrickPlayView[];
}

/** Mirror of the backend HeartsGameView — the exact JSON the table renders. */
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
  lastTrick: CompletedTrickView | null;
  winnerSeat: SeatIndex | null;
}

export const cardKey = (card: CardRef): string => `${card.name}-${card.suit}`;

export const PASS_DIRECTION_LABEL: Record<PassDirection, string> = {
  left: 'Passing left',
  right: 'Passing right',
  across: 'Passing across',
  hold: 'No pass (hold)',
};
