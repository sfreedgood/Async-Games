import { ClassicDeck } from '../classic-card/classic-card.entity';
import { classicCardValues } from '../classic-card/classic-card.interface';

import {
  emptySeatRecord,
  type HeartsGame,
  type PlayerSeat,
  type SeatRecord,
  type TrickPlay,
} from './hearts.entity';
import {
  CARDS_PER_HAND,
  cardsEqual,
  GAME_END_SCORE,
  HEART_POINTS,
  HEARTS_PLAYER_COUNT,
  isHeart,
  isQueenOfSpades,
  PASS_ROTATION,
  QUEEN_OF_SPADES_POINTS,
  RULES,
  SEATS,
  SHOOT_THE_MOON_POINTS,
  TWO_OF_CLUBS,
  type CardRef,
  type HeartsSuit,
  type PassDirection,
  type SeatIndex,
} from './hearts.interface';

const SUIT_ORDER: Record<HeartsSuit, number> = {
  club: 0,
  diamond: 1,
  spade: 2,
  heart: 3,
};

const BOT_NAMES: Record<Exclude<SeatIndex, 0>, string> = {
  1: 'West',
  2: 'North',
  3: 'East',
};

export const cardValue = (card: CardRef): number =>
  classicCardValues[card.name];

export const nextSeat = (seat: SeatIndex): SeatIndex =>
  (((seat + 1) % HEARTS_PLAYER_COUNT) as SeatIndex);

const sortHand = (cards: CardRef[]): CardRef[] =>
  cards
    .slice()
    .sort(
      (a, b) =>
        SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] || cardValue(a) - cardValue(b)
    );

const removeCard = (cards: CardRef[], card: CardRef): CardRef[] => {
  const index = cards.findIndex((c) => cardsEqual(c, card));
  if (index === -1) return cards;
  return [...cards.slice(0, index), ...cards.slice(index + 1)];
};

/** Builds the four player seats (seat 0 human, 1–3 bots). */
const buildPlayers = (humanName: string): PlayerSeat[] =>
  SEATS.map((seat) => ({
    seat,
    playerId: `seat-${seat}`,
    name: seat === 0 ? humanName : BOT_NAMES[seat],
    isBot: seat !== 0,
  }));

/** Pass direction for a 0-based round index. */
export const passDirectionForRound = (roundNumber: number): PassDirection =>
  PASS_ROTATION[roundNumber % PASS_ROTATION.length];

/** Seat that receives the cards passed from `fromSeat` in the given direction. */
export const passTargetSeat = (
  fromSeat: SeatIndex,
  direction: PassDirection
): SeatIndex => {
  const offset = { left: 1, across: 2, right: 3, hold: 0 }[direction];
  return (((fromSeat + offset) % HEARTS_PLAYER_COUNT) as SeatIndex);
};

const findTwoOfClubsHolder = (hands: SeatRecord<CardRef[]>): SeatIndex =>
  (SEATS.find((seat) =>
    hands[seat].some((c) => cardsEqual(c, TWO_OF_CLUBS))
  ) as SeatIndex);

/** Sets the game into the playing phase, led by whoever holds the 2♣. */
const startPlay = (game: HeartsGame): void => {
  const leader = findTwoOfClubsHolder(game.hands);
  game.phase = 'playing';
  game.trickLeader = leader;
  game.currentTurn = leader;
  game.currentTrick = { leadSuit: null, plays: [] };
};

/**
 * Deals a fresh round into `game` using its seed + round number, and either
 * opens the passing phase or (on a "hold" round) jumps straight to play.
 */
export const dealRound = (game: HeartsGame): void => {
  const deck = new ClassicDeck();
  deck.shuffle(game.seed + game.roundNumber);
  const refs: CardRef[] = deck.cards.map((c) => ({
    name: c.name as CardRef['name'],
    suit: c.suit as HeartsSuit,
  }));

  game.hands = emptySeatRecord<CardRef[]>(() => []);
  SEATS.forEach((seat) => {
    game.hands[seat] = sortHand(
      refs.slice(seat * CARDS_PER_HAND, seat * CARDS_PER_HAND + CARDS_PER_HAND)
    );
  });

  game.passDirection = passDirectionForRound(game.roundNumber);
  game.pendingPasses = emptySeatRecord<CardRef[]>(() => []);
  game.tricksTaken = emptySeatRecord<CardRef[]>(() => []);
  game.roundScores = emptySeatRecord<number>(() => 0);
  game.heartsBroken = false;
  game.tricksPlayed = 0;
  game.lastTrick = null;
  game.currentTrick = { leadSuit: null, plays: [] };

  if (game.passDirection === 'hold') {
    startPlay(game);
  } else {
    game.phase = 'passing';
  }
};

export interface CreateGameOptions {
  gameId: string;
  humanName: string;
  seed: number;
}

/** Creates a new game and deals the first round. */
export const createGame = ({
  gameId,
  humanName,
  seed,
}: CreateGameOptions): HeartsGame => {
  const game: HeartsGame = {
    gameId,
    players: buildPlayers(humanName),
    phase: 'passing',
    roundNumber: 0,
    passDirection: passDirectionForRound(0),
    hands: emptySeatRecord<CardRef[]>(() => []),
    pendingPasses: emptySeatRecord<CardRef[]>(() => []),
    heartsBroken: false,
    currentTrick: { leadSuit: null, plays: [] },
    trickLeader: 0,
    currentTurn: 0,
    tricksPlayed: 0,
    tricksTaken: emptySeatRecord<CardRef[]>(() => []),
    roundScores: emptySeatRecord<number>(() => 0),
    totalScores: emptySeatRecord<number>(() => 0),
    lastTrick: null,
    winnerSeat: null,
    seed,
  };
  dealRound(game);
  return game;
};

/** Records a seat's chosen pass; resolves the exchange once all four are in. */
export const setPendingPass = (
  game: HeartsGame,
  seat: SeatIndex,
  cards: CardRef[]
): void => {
  game.pendingPasses[seat] = cards.slice();
  const allChosen = SEATS.every(
    (s) => game.pendingPasses[s].length > 0
  );
  if (allChosen) applyPasses(game);
};

/** Moves the pending passes between hands simultaneously and starts play. */
export const applyPasses = (game: HeartsGame): void => {
  SEATS.forEach((seat) => {
    game.pendingPasses[seat].forEach((card) => {
      game.hands[seat] = removeCard(game.hands[seat], card);
    });
  });
  SEATS.forEach((seat) => {
    const target = passTargetSeat(seat, game.passDirection);
    game.hands[target] = game.hands[target].concat(game.pendingPasses[seat]);
  });
  SEATS.forEach((seat) => {
    game.hands[seat] = sortHand(game.hands[seat]);
  });
  game.pendingPasses = emptySeatRecord<CardRef[]>(() => []);
  startPlay(game);
};

/**
 * The legal cards `seat` may play right now. This is the single source of
 * truth for legality — both the move validator and the bot consult it.
 */
export const getLegalMoves = (
  game: HeartsGame,
  seat: SeatIndex
): CardRef[] => {
  if (game.phase !== 'playing' || game.currentTurn !== seat) return [];
  // A completed trick must be resolved (acknowledged) before anyone plays on.
  if (game.currentTrick.plays.length >= HEARTS_PLAYER_COUNT) return [];

  const hand = game.hands[seat];
  const isLead = game.currentTrick.plays.length === 0;
  const firstTrick = game.tricksPlayed === 0;

  if (isLead) {
    if (firstTrick) {
      const two = hand.find((c) => cardsEqual(c, TWO_OF_CLUBS));
      return two ? [two] : [];
    }
    if (!game.heartsBroken) {
      const nonHearts = hand.filter((c) => !isHeart(c));
      return nonHearts.length ? nonHearts : hand.slice();
    }
    return hand.slice();
  }

  const sameSuit = hand.filter((c) => c.suit === game.currentTrick.leadSuit);
  if (sameSuit.length) return sameSuit;

  if (firstTrick && RULES.noPointsOnFirstTrick) {
    const nonPoint = hand.filter(
      (c) => !isHeart(c) && !isQueenOfSpades(c)
    );
    if (nonPoint.length) return nonPoint;
  }
  return hand.slice();
};

/**
 * Plays a card for `seat` into the current trick. Assumes legality was already
 * checked (the validator gates HTTP; the bot only picks from getLegalMoves).
 * Advances the turn; does NOT resolve the trick — call resolveTrick when full.
 */
export const playCard = (
  game: HeartsGame,
  seat: SeatIndex,
  card: CardRef
): void => {
  game.hands[seat] = removeCard(game.hands[seat], card);
  if (game.currentTrick.plays.length === 0) {
    game.currentTrick.leadSuit = card.suit;
  }
  game.currentTrick.plays.push({ seat, card });
  if (isHeart(card)) game.heartsBroken = true;
  game.currentTurn = nextSeat(seat);
};

export const isTrickComplete = (game: HeartsGame): boolean =>
  game.currentTrick.plays.length === HEARTS_PLAYER_COUNT;

/** Determines the winner of a completed trick (highest card of the lead suit). */
export const trickWinner = (plays: TrickPlay[], leadSuit: HeartsSuit): SeatIndex => {
  const winning = plays
    .filter((p) => p.card.suit === leadSuit)
    .reduce((best, p) => (cardValue(p.card) > cardValue(best.card) ? p : best));
  return winning.seat;
};

/**
 * Resolves a completed trick: awards its cards to the winner, who then leads
 * the next trick. Returns the winning seat.
 */
export const resolveTrick = (game: HeartsGame): SeatIndex => {
  const leadSuit = game.currentTrick.leadSuit as HeartsSuit;
  const winner = trickWinner(game.currentTrick.plays, leadSuit);
  const takenCards = game.currentTrick.plays.map((p) => p.card);
  game.tricksTaken[winner] = game.tricksTaken[winner].concat(takenCards);
  // Track the running round score as tricks are taken so the UI can show live
  // points; scoreRound later overwrites this with the shoot-the-moon-adjusted
  // final tally.
  game.roundScores[winner] += rawPointsTaken(takenCards);
  game.lastTrick = {
    winnerSeat: winner,
    plays: game.currentTrick.plays.map((p) => ({ ...p })),
  };
  game.tricksPlayed += 1;
  game.currentTrick = { leadSuit: null, plays: [] };
  game.trickLeader = winner;
  game.currentTurn = winner;
  return winner;
};

export const isRoundComplete = (game: HeartsGame): boolean =>
  game.tricksPlayed === CARDS_PER_HAND;

/** Raw points a seat took this round (before shoot-the-moon adjustment). */
const rawPointsTaken = (cards: CardRef[]): number =>
  cards.reduce(
    (sum, c) =>
      sum +
      (isHeart(c) ? HEART_POINTS : 0) +
      (isQueenOfSpades(c) ? QUEEN_OF_SPADES_POINTS : 0),
    0
  );

/**
 * Scores the completed round into roundScores and totalScores, applying the
 * shoot-the-moon rule (one seat taking all 26 points scores 0; everyone else
 * gains 26). Moves the game into the round-scoring phase.
 */
export const scoreRound = (game: HeartsGame): void => {
  const raw = emptySeatRecord<number>(() => 0);
  SEATS.forEach((seat) => {
    raw[seat] = rawPointsTaken(game.tricksTaken[seat]);
  });

  const shooter = SEATS.find((seat) => raw[seat] === SHOOT_THE_MOON_POINTS);

  SEATS.forEach((seat) => {
    const points =
      shooter !== undefined
        ? seat === shooter
          ? 0
          : SHOOT_THE_MOON_POINTS
        : raw[seat];
    game.roundScores[seat] = points;
    game.totalScores[seat] += points;
  });

  game.phase = 'round-scoring';
};

export const isGameOver = (game: HeartsGame): boolean =>
  SEATS.some((seat) => game.totalScores[seat] >= GAME_END_SCORE);

/** Marks the game finished, with the lowest total score winning. */
export const finishGame = (game: HeartsGame): void => {
  const winner = SEATS.reduce((best, seat) =>
    game.totalScores[seat] < game.totalScores[best] ? seat : best
  );
  game.winnerSeat = winner;
  game.phase = 'finished';
};

/** Advances to the next round, dealing fresh hands. */
export const startNextRound = (game: HeartsGame): void => {
  game.roundNumber += 1;
  dealRound(game);
};
