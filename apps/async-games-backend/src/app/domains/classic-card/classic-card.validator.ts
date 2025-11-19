import {
  ClassicCardName,
  ClassicCardSuit,
  joker,
  classicCardSuits,
  classicCardValues,
} from './classic-card.interface';
import {
  RequiredClassicCardFields,
  requiredClassicCardFields,
} from '../../../abstract/card';
import {
  EntityValidationError,
  ValidationErrorMessage,
} from '../../../utils/error.utils';
import { ClassicPlayingCard } from './classic-card.entity';

const validClassicCardNames = new Set([
  ...Object.keys(joker),
  ...Object.keys(classicCardValues),
]);
const validClassicCardSuits = new Set([
  ...Object.keys(joker),
  ...Object.keys(classicCardSuits),
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

  if (cardData.name === undefined || !isValidClassicCardName(cardData.name)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'name' property must be one of: ${[...validClassicCardNames].join(', ')}`
    );
  }

  if (cardData.suit === undefined || !isValidClassicCardSuit(cardData.suit)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'suit' property must be one of: ${[...validClassicCardSuits].join(', ')}`
    );
  }

  return new ClassicPlayingCard(name, suit);
};

// Helpers
const isValidClassicCardName = (
  name: string | ClassicCardName
): name is ClassicCardName => validClassicCardNames.has(name);

const isValidClassicCardSuit = (
  suit: string | ClassicCardSuit
): suit is ClassicCardSuit => validClassicCardSuits.has(suit);

const isMissingRequiredFields = (
  cardData: object
): false | Array<RequiredClassicCardFields> => {
  const assignedProperties = new Set(Object.keys(cardData));
  const missingFields = requiredClassicCardFields.filter(
    (requiredField) => !assignedProperties.has(requiredField)
  );

  return missingFields.length ? missingFields : false;
};

export { isValidClassicCardName, isValidClassicCardSuit, validateCard };
