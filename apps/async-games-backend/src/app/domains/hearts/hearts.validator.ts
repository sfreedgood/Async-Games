import {
  EntityValidationError,
  ValidationErrorMessage,
} from '../../../utils/error.utils';
import { getLegalMoves } from './hearts.engine';
import type { HeartsGame } from './hearts.entity';
import {
  CARDS_TO_PASS,
  cardKey,
  cardsEqual,
  type CardRef,
  type SeatIndex,
} from './hearts.interface';

const handHas = (game: HeartsGame, seat: SeatIndex, card: CardRef): boolean =>
  game.hands[seat].some((c) => cardsEqual(c, card));

/** Validates a single card play, throwing 422 on any rule violation. */
export const validatePlay = (
  game: HeartsGame,
  seat: SeatIndex,
  card: CardRef
): void => {
  if (game.phase !== 'playing') {
    throw new EntityValidationError(
      ValidationErrorMessage.WRONG_PHASE,
      `cannot play a card during the '${game.phase}' phase`
    );
  }
  if (game.currentTurn !== seat) {
    throw new EntityValidationError(
      ValidationErrorMessage.OUT_OF_TURN,
      `it is seat ${game.currentTurn}'s turn, not seat ${seat}`
    );
  }
  if (!handHas(game, seat, card)) {
    throw new EntityValidationError(
      ValidationErrorMessage.CARD_NOT_IN_HAND,
      `${cardKey(card)} is not in seat ${seat}'s hand`
    );
  }
  if (!getLegalMoves(game, seat).some((c) => cardsEqual(c, card))) {
    throw new EntityValidationError(
      ValidationErrorMessage.ILLEGAL_MOVE,
      `${cardKey(card)} is not a legal play right now`
    );
  }
};

/** Validates a 3-card pass selection, throwing 422 on any rule violation. */
export const validatePass = (
  game: HeartsGame,
  seat: SeatIndex,
  cards: CardRef[]
): void => {
  if (game.phase !== 'passing') {
    throw new EntityValidationError(
      ValidationErrorMessage.WRONG_PHASE,
      `cannot pass cards during the '${game.phase}' phase`
    );
  }
  const distinct = new Set(cards.map(cardKey));
  if (cards.length !== CARDS_TO_PASS || distinct.size !== CARDS_TO_PASS) {
    throw new EntityValidationError(
      ValidationErrorMessage.ILLEGAL_MOVE,
      `must pass exactly ${CARDS_TO_PASS} distinct cards`
    );
  }
  const missing = cards.find((card) => !handHas(game, seat, card));
  if (missing) {
    throw new EntityValidationError(
      ValidationErrorMessage.CARD_NOT_IN_HAND,
      `${cardKey(missing)} is not in seat ${seat}'s hand`
    );
  }
};
