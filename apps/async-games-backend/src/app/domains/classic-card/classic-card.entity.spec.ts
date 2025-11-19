import {
  ClassicDeck,
  ClassicPlayingCard,
  handleClassicCardOptions,
} from './classic-card.entity';
import {
  ClassicCardSuit,
  ClassicCardValue,
  classicCardSuits,
} from './classic-card.interface';

describe('handleClassicCardOptions', () => {
  it('should apply default options when no options are provided', () => {
    const cardValue = handleClassicCardOptions('10');
    expect(cardValue).toEqual(10);
  });

  it('should allow overriding default value with valueOverride option', () => {
    const cardValueAce = handleClassicCardOptions('A', {
      valueOverride: { A: 1 as ClassicCardValue },
    });
    const cardValueTen = handleClassicCardOptions('10', {
      valueOverride: { '10': 9 as ClassicCardValue },
    });

    expect(cardValueAce).toEqual(1);
    expect(cardValueTen).toEqual(9);
  });

  it('should return 15 if the card name is "joker"', () => {
    const cardValueJoker = handleClassicCardOptions('joker');
    expect(cardValueJoker).toEqual(15);
  });
});

describe('ClassicPlayingCard', () => {
  describe('constructor', () => {
    it('should create a ClassicPlayingCard instance with given properties', () => {
      const card = new ClassicPlayingCard('A', 'spade');
      expect(card.name).toBe('A');
      expect(card.suit).toBe('spade');
    });

    it('should allow users to override default values', () => {
      const card = new ClassicPlayingCard('K', 'spade', {
        valueOverride: { K: 9 },
      });
      expect(card.name).toBe('K');
      expect(card.suit).toBe('spade');
      expect(card.value).toBe(9);
    });

    it('should allow users to override the Ace to be low instead of high', () => {
      const deck = new ClassicDeck({ aceLow: true });
      const aces = deck.cards.filter((card) => card.name === 'A');

      const expectedAces = Object.values(classicCardSuits).map(
        (suit) =>
          new ClassicPlayingCard('A', suit, {
            valueOverride: { A: 1 as ClassicCardValue },
          })
      );

      expect(aces.length).toBe(4);
      expect(aces).toEqual(expectedAces);
    });
  });

  describe('color', () => {
    const expectedColorMapping: Record<ClassicCardSuit, string | null> = {
      heart: 'red',
      spade: 'black',
      club: 'black',
      diamond: 'red',
      joker: null,
    };

    for (const suit of Object.keys(
      expectedColorMapping
    ) as Array<ClassicCardSuit>) {
      it(`should return the correct color for the card, when the suit is ${suit}`, () => {
        const card = new ClassicPlayingCard('A', suit);
        expect(card.color).toBe(expectedColorMapping[suit]); // Assuming heart is red
      });
    }
  });

  describe('makeAceLow', () => {
    it('should set ace value to 1 for true', () => {
      const card = new ClassicPlayingCard('A', 'spade');
      expect(card.value).toBe(14);

      card.makeAceLow(true);
      expect(card.value).toBe(1);
    });

    it('should set ace value to 14 for false by default', () => {
      const card = new ClassicPlayingCard('A', 'spade');
      expect(card.value).toBe(14);

      card.makeAceLow(true);
      expect(card.value).toBe(1);

      card.makeAceLow(false);
      expect(card.value).toBe(14);
    });

    it('should set ace to override value if set and passed false', () => {
      const card = new ClassicPlayingCard('A', 'spade', {
        valueOverride: { A: 6 },
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

      const card = new ClassicPlayingCard('10', 'spade');
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
});
