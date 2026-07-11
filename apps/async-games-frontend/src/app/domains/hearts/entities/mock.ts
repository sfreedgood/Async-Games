import type { CardRef, HeartsGameView, HeartsPlayerView } from './game';

const card = (name: CardRef['name'], suit: CardRef['suit']): CardRef => ({
  name,
  suit,
});

const players = (): HeartsPlayerView[] => [
  { seat: 0, name: 'You', isBot: false, handCount: 13, totalScore: 12, roundScore: 4 },
  { seat: 1, name: 'West', isBot: true, handCount: 13, totalScore: 30, roundScore: 0 },
  { seat: 2, name: 'North', isBot: true, handCount: 13, totalScore: 22, roundScore: 7 },
  { seat: 3, name: 'East', isBot: true, handCount: 13, totalScore: 18, roundScore: 1 },
];

const sampleHand: CardRef[] = [
  card('2', 'club'),
  card('5', 'club'),
  card('9', 'club'),
  card('4', 'diamond'),
  card('K', 'diamond'),
  card('3', 'spade'),
  card('Q', 'spade'),
  card('6', 'heart'),
  card('A', 'heart'),
];

/** Builds a HeartsGameView for stories/tests, overridable per scenario. */
export const mockGameView = (
  overrides: Partial<HeartsGameView> = {}
): HeartsGameView => ({
  gameId: 'mock-game',
  phase: 'playing',
  roundNumber: 0,
  passDirection: 'left',
  heartsBroken: false,
  viewerSeat: 0,
  currentTurn: 0,
  trickLeader: 0,
  players: players(),
  yourHand: sampleHand,
  legalMoves: [card('2', 'club'), card('5', 'club'), card('9', 'club')],
  pendingPassCount: 0,
  currentTrick: {
    leadSuit: 'club',
    plays: [{ seat: 3, card: card('7', 'club') }],
  },
  awaitingTrickAck: false,
  pendingTrickWinner: null,
  lastTrick: null,
  winnerSeat: null,
  ...overrides,
});
