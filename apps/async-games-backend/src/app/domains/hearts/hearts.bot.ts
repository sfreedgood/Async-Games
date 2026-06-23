import {
  cardValue,
  getLegalMoves,
} from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import {
  CARDS_TO_PASS,
  isHeart,
  isQueenOfSpades,
  type CardRef,
  type SeatIndex,
} from './hearts.interface';

/**
 * Deterministic bot policy. Given the same game state it always picks the same
 * cards, which keeps end-to-end game tests reproducible. Every returned play is
 * guaranteed to be in getLegalMoves — the bot never produces an illegal move.
 */

/** Highest card of the lead suit currently winning the trick, or null. */
const winningLeadValue = (game: HeartsGame): number | null => {
  const { leadSuit, plays } = game.currentTrick;
  if (leadSuit === null) return null;
  const ofLead = plays.filter((p) => p.card.suit === leadSuit);
  if (!ofLead.length) return null;
  return Math.max(...ofLead.map((p) => cardValue(p.card)));
};

const lowestByValue = (cards: CardRef[]): CardRef =>
  cards.reduce((best, c) => (cardValue(c) < cardValue(best) ? c : best));

const highestByValue = (cards: CardRef[]): CardRef =>
  cards.reduce((best, c) => (cardValue(c) > cardValue(best) ? c : best));

/** How undesirable a card is to keep — higher means pass it away first. */
const dangerScore = (card: CardRef): number => {
  if (isQueenOfSpades(card)) return 1000;
  if (card.suit === 'spade' && (card.name === 'A' || card.name === 'K')) {
    return 900 + cardValue(card);
  }
  if (isHeart(card)) return 500 + cardValue(card);
  return cardValue(card);
};

/** Picks the 3 most dangerous cards to pass. */
export const chooseCardsToPass = (
  game: HeartsGame,
  seat: SeatIndex
): CardRef[] =>
  game.hands[seat]
    .slice()
    .sort((a, b) => dangerScore(b) - dangerScore(a))
    .slice(0, CARDS_TO_PASS);

/** Picks a legal card to play, favouring ducking tricks and shedding points. */
export const chooseCardToPlay = (
  game: HeartsGame,
  seat: SeatIndex
): CardRef => {
  const legal = getLegalMoves(game, seat);
  const isLead = game.currentTrick.plays.length === 0;

  if (isLead) {
    // Lead the lowest card to stay safe.
    return lowestByValue(legal);
  }

  const mustFollow = legal.every(
    (c) => c.suit === game.currentTrick.leadSuit
  );

  if (mustFollow) {
    const highWater = winningLeadValue(game);
    const underdogs =
      highWater === null
        ? []
        : legal.filter((c) => cardValue(c) < highWater);
    // Duck just below the winning card if possible; otherwise play low.
    return underdogs.length ? highestByValue(underdogs) : lowestByValue(legal);
  }

  // Off-suit discard: shed the worst point card we can.
  const queen = legal.find(isQueenOfSpades);
  if (queen) return queen;
  const hearts = legal.filter(isHeart);
  if (hearts.length) return highestByValue(hearts);
  return highestByValue(legal);
};
