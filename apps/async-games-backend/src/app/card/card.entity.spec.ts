import { StandardPlayingCard } from './card.entity';
import { CardSuit } from './card.interface';

describe('StandardPlayingCard', () => {
  describe('constructor', () => {
    it('should create a StandardPlayingCard instance with given properties', () => {
      const card = new StandardPlayingCard('A', 'spade');
      expect(card.name).toBe('A');
      expect(card.suit).toBe('spade');
    });

    it('should allow users to override default values', () => {
      const card = new StandardPlayingCard('K', 'spade', {
        valueOverrides: { K: 9 },
      });
      expect(card.name).toBe('K');
      expect(card.suit).toBe('spade');
      expect(card.value).toBe(9);
    });

    it('should allow users to override the Ace to be low instead of high', () => {
      const card = new StandardPlayingCard('A', 'spade', { aceLow: true });
      expect(card.name).toBe('A');
      expect(card.value).toBe(1);
    });
  });

  describe('color', () => {
    const expectedColorMapping: Record<CardSuit, string | null> = {
      heart: 'red',
      spade: 'black',
      club: 'black',
      diamond: 'red',
      joker: null,
    };

    for (const suit of Object.keys(expectedColorMapping) as Array<CardSuit>) {
      it(`should return the correct color for the card, when the suit is ${suit}`, () => {
        const card = new StandardPlayingCard('A', suit);
        expect(card.color).toBe(expectedColorMapping[suit]); // Assuming heart is red
      });
    }
  });

  describe('makeAceLow', () => {
    it('should set ace value to 1 for true', () => {
      const card = new StandardPlayingCard('A', 'spade');
      expect(card.value).toBe(14);

      card.makeAceLow(true);
      expect(card.value).toBe(1);
    });

    it('should set ace value to 14 for false by default', () => {
      const card = new StandardPlayingCard('A', 'spade');
      expect(card.value).toBe(14);

      card.makeAceLow(true);
      expect(card.value).toBe(1);

      card.makeAceLow(false);
      expect(card.value).toBe(14);
    });

    it('should set ace to override value if set and passed false', () => {
      const card = new StandardPlayingCard('A', 'spade', {
        valueOverrides: { A: 6 },
      });
      expect(card.value).toBe(6);

      card.makeAceLow(true);
      expect(card.value).toBe(1);

      card.makeAceLow(false);
      expect(card.value).toBe(6);
    });

    it('should ignore any other card type', () => {
      const originalError = console.error; // TODO: update for error handling once implemented
      console.error = jest.fn();

      const card = new StandardPlayingCard('10', 'spade');
      expect(card.name).toBe('10');
      expect(card.suit).toBe('spade');
      expect(card.value).toBe(10);

      card.makeAceLow(true);
      expect(card.name).toBe('10');
      expect(card.suit).toBe('spade');
      expect(card.value).toBe(10);

      //TODO: update for error handling once implemented
      expect(console.error).toHaveBeenCalledWith(
        'method not applicable to selected card, ignoring'
      );
      console.error = originalError;
    });
  });

  describe('trumpSuit', () => {
    it('`isTrumpSuit` should return undefined if the trump suit is not set', () => {
      const card = new StandardPlayingCard('A', 'spade');
      expect(card.isTrumpSuit).toBe(undefined);
    });

    it('`isTrumpSuit` should return true if the card is a trump card', () => {
      const card = new StandardPlayingCard('A', 'heart');
      expect(card.isTrumpSuit('heart')).toBe(true);
    });

    it('`isTrumpSuit` should return false if the card is not a trump card', () => {
      const card = new StandardPlayingCard('A', 'spade');
      expect(card.isTrumpSuit('heart')).toBe(false);
    });
  });
});
