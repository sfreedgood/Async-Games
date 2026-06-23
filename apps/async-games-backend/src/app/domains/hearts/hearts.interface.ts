import type {
  ClassicCardName,
  ClassicCardSuit,
} from '../classic-card/classic-card.interface';

/** Hearts uses a standard 52-card deck — the four suits, no jokers. */
export type HeartsSuit = Exclude<ClassicCardSuit, 'joker'>;
/** Card names in a Hearts deck (no joker). */
export type HeartsCardName = Exclude<ClassicCardName, 'joker'>;

/**
 * Value-based card identity used across the engine and API. We intentionally
 * match cards by {name, suit} rather than object identity so that requests
 * (plain JSON) can refer to a card in a hand.
 */
export type CardRef = {
  name: HeartsCardName;
  suit: HeartsSuit;
};

/** Seats around the table. Seat 0 is the human; 1–3 are bots. */
export type SeatIndex = 0 | 1 | 2 | 3;
export const SEATS: readonly SeatIndex[] = [0, 1, 2, 3];

/** Rotating pass direction by round (left, right, across, hold, repeat). */
export type PassDirection = 'left' | 'right' | 'across' | 'hold';
export const PASS_ROTATION: readonly PassDirection[] = [
  'left',
  'right',
  'across',
  'hold',
];

export type GamePhase = 'passing' | 'playing' | 'round-scoring' | 'finished';

export const HEARTS_PLAYER_COUNT = 4;
export const CARDS_PER_HAND = 13;
export const CARDS_TO_PASS = 3;
export const GAME_END_SCORE = 100;
export const SHOOT_THE_MOON_POINTS = 26;
export const QUEEN_OF_SPADES_POINTS = 13;
export const HEART_POINTS = 1;

/** The card that must lead the first trick of every round. */
export const TWO_OF_CLUBS: CardRef = { name: '2', suit: 'club' };
export const QUEEN_OF_SPADES: CardRef = { name: 'Q', suit: 'spade' };

/**
 * Rule-variant seams — toggled here so future iterations can expose them as
 * game options without touching engine logic.
 */
export const RULES = {
  /** Hearts and Q♠ may not be played on the very first trick of a round. */
  noPointsOnFirstTrick: true,
} as const;

export const isHeart = (card: CardRef): boolean => card.suit === 'heart';
export const isQueenOfSpades = (card: CardRef): boolean =>
  card.suit === 'spade' && card.name === 'Q';
export const cardsEqual = (a: CardRef, b: CardRef): boolean =>
  a.name === b.name && a.suit === b.suit;
export const cardKey = (card: CardRef): string => `${card.name}-${card.suit}`;
