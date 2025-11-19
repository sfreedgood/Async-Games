import { EntityValidationError } from '../../../utils/error.utils';
import { ClassicPlayingCard } from './classic-card.entity';
import { ClassicCardName, ClassicCardSuit } from './classic-card.interface';
import {
  isValidClassicCardName,
  isValidClassicCardSuit,
  isMissingRequiredFields,
  validateCard,
} from './classic-card.validator';

describe('isMissingRequiredFields', () => {
  it('should return true for missing required fields', () => {
    const missingName = { suit: 'heart' }; // Missing name
    const missingSuit = { name: 'A' }; // Missing suit
    const missingBoth = {}; // Missing both fields

    expect(isMissingRequiredFields(missingName)).toStrictEqual(['name']);
    expect(isMissingRequiredFields(missingSuit)).toStrictEqual(['suit']);
    expect(isMissingRequiredFields(missingBoth)).toStrictEqual([
      'name',
      'suit',
    ]);
  });

  it('should return false for complete card data', () => {
    const completeCardData = { name: 'A', suit: 'heart' };
    expect(isMissingRequiredFields(completeCardData)).toBe(false);
  });
});

describe('isValidClassicCardName', () => {
  it('should return true for valid classic card names', () => {
    expect(isValidClassicCardName('A')).toBe(true);
    expect(isValidClassicCardName('K')).toBe(true);
  });

  it('should return false for invalid classic card names', () => {
    expect(isValidClassicCardName('InvalidName')).toBe(false);
    expect(isValidClassicCardName('')).toBe(false);
  });
});

describe('isValidClassicCardSuit', () => {
  it('should return true for valid classic card suits', () => {
    expect(isValidClassicCardSuit('club')).toBe(true);
    expect(isValidClassicCardSuit('spade')).toBe(true);
    expect(isValidClassicCardSuit('diamond')).toBe(true);
    expect(isValidClassicCardSuit('heart')).toBe(true);
  });

  it('should return false for invalid classic card suits', () => {
    expect(isValidClassicCardSuit('InvalidSuit')).toBe(false);
    expect(isValidClassicCardSuit('')).toBe(false);
  });
});

describe('validateCard', () => {
  let name: ClassicCardName;
  let suit: ClassicCardSuit;

  beforeAll(() => {
    name = 'A';
    suit = 'heart';
  });

  it('should validate a card with valid data', () => {
    const validCardData = { name, suit };
    expect(validateCard(validCardData)).toStrictEqual(
      new ClassicPlayingCard(name, suit)
    );
  });

  it('should throw an error for a card with missing fields', () => {
    const invalidCardData = { name }; // Missing suit
    expect(() => validateCard(invalidCardData)).toThrow(EntityValidationError);

    try {
      validateCard(invalidCardData);
    } catch (e) {
      const error = e as EntityValidationError;
      expect(error.cause).toBeDefined(); // Check if cause is defined
      expect(error.cause).toBe('Missing Required Field: suit');
    }
  });

  it('should list all missing fields if multiple', () => {
    const invalidCardData = {}; // Missing suit and name
    expect(() => validateCard(invalidCardData)).toThrow(EntityValidationError);

    try {
      validateCard(invalidCardData);
    } catch (e) {
      const error = e as EntityValidationError;
      expect(error.cause).toBeDefined(); // Check if cause is defined
      expect(error.cause).toBe('Missing Required Field: name, suit');
    }
  });

  it('should throw an error for a card with invalid name', () => {
    const invalidCardData = { name: 'InvalidName', suit };
    expect(() => validateCard(invalidCardData)).toThrow(EntityValidationError);
  });

  it('should throw an error for a card with invalid suit', () => {
    const invalidCardData = { name, suit: 'InvalidSuit' };
    expect(() => validateCard(invalidCardData)).toThrow(EntityValidationError);
  });
});
