import type {
  CardRef,
  GamePhase,
  HeartsSuit,
  PassDirection,
  SeatIndex,
} from './hearts.interface';

/** A value keyed by every seat at the table. */
export type SeatRecord<T> = Record<SeatIndex, T>;

export interface PlayerSeat {
  seat: SeatIndex;
  playerId: string;
  name: string;
  isBot: boolean;
}

export interface TrickPlay {
  seat: SeatIndex;
  card: CardRef;
}

export interface Trick {
  leadSuit: HeartsSuit | null;
  plays: TrickPlay[];
}

export interface CompletedTrick {
  winnerSeat: SeatIndex;
  plays: TrickPlay[];
}

/**
 * The full authoritative game aggregate. Held in memory by the store and
 * mutated only through the pure engine functions. `hands` holds every seat's
 * real cards and is server-only — the API view hides opponents' hands.
 */
export interface HeartsGame {
  gameId: string;
  players: PlayerSeat[];
  phase: GamePhase;
  /** 0-based round index; drives the pass direction. */
  roundNumber: number;
  passDirection: PassDirection;
  hands: SeatRecord<CardRef[]>;
  /** Cards each seat has selected to pass, before the exchange resolves. */
  pendingPasses: SeatRecord<CardRef[]>;
  heartsBroken: boolean;
  currentTrick: Trick;
  trickLeader: SeatIndex;
  currentTurn: SeatIndex;
  /** Completed tricks this round (0–13). */
  tricksPlayed: number;
  /** Cards won (taken in tricks) by each seat this round. */
  tricksTaken: SeatRecord<CardRef[]>;
  roundScores: SeatRecord<number>;
  totalScores: SeatRecord<number>;
  lastTrick: CompletedTrick | null;
  winnerSeat: SeatIndex | null;
  /** Seed for the current round's deal — enables deterministic replay. */
  seed: number;
}

/** Builds a seat-keyed record with the same initial value for every seat. */
export const emptySeatRecord = <T>(make: () => T): SeatRecord<T> => ({
  0: make(),
  1: make(),
  2: make(),
  3: make(),
});
