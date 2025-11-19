import {
  CardName,
  CardSuit,
  joker,
  standardSuits,
  standardValues,
} from './card.interface';
import {
  RequiredStandardCardFields,
  requiredStandardCardFields,
} from '../../abstract/card';
import {
  EntityValidationError,
  ValidationErrorMessage,
} from '../../utils/error.utils';
import { StandardPlayingCard } from './card.entity';

const validCardNames = new Set([
  ...Object.keys(joker),
  ...Object.keys(standardValues),
]);
const validCardSuits = new Set([
  ...Object.keys(joker),
  ...Object.keys(standardSuits),
]);

const validateCard = (cardData: any) => {
  const { name, suit } = cardData;

  const hasMissingRequiredFields = isMissingRequiredFields(cardData);
  if (hasMissingRequiredFields) {
    throw new EntityValidationError(
      ValidationErrorMessage.MISSING_REQUIRED_FIELD,
      hasMissingRequiredFields.join(', ')
    );
  }

  if (cardData.name === undefined || !isValidCardName(cardData.name)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'name' property must be one of: ${[...validCardNames].join(', ')}`
    );
  }

  if (cardData.suit === undefined || !isValidCardSuit(cardData.suit)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'suit' property must be one of: ${[...validCardSuits].join(', ')}`
    );
  }

  return new StandardPlayingCard(name, suit);
};

// Helpers
const isValidCardName = (name: string | CardName): name is CardName =>
  validCardNames.has(name);

const isValidCardSuit = (suit: string | CardSuit): suit is CardSuit =>
  validCardSuits.has(suit);

const isMissingRequiredFields = (
  cardData: object
): false | Array<RequiredStandardCardFields> => {
  const assignedProperties = new Set(Object.keys(cardData));
  const missingFields = requiredStandardCardFields.filter(
    (requiredField) => !assignedProperties.has(requiredField)
  );

  return missingFields.length ? missingFields : false;
};

export { isValidCardName, isValidCardSuit, validateCard };
