import { Deck } from './deck';

const buildNumberDeck = () => new Deck(Array.from({ length: 52 }, (_, i) => i));

describe('Deck.shuffle', () => {
  it('produces the same order for the same seed', () => {
    const a = buildNumberDeck().shuffle(12345);
    const b = buildNumberDeck().shuffle(12345);
    expect(a.cards).toEqual(b.cards);
  });

  it('produces a different order for different seeds', () => {
    const a = buildNumberDeck().shuffle(1);
    const b = buildNumberDeck().shuffle(2);
    expect(a.cards).not.toEqual(b.cards);
  });

  it('preserves the full multiset of cards (no loss or duplication)', () => {
    const original = buildNumberDeck().cards.slice();
    const shuffled = buildNumberDeck().shuffle(999).cards;
    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort((x, y) => x - y)).toEqual(original);
  });

  it('actually reorders the deck (seed not a no-op)', () => {
    const ordered = buildNumberDeck().cards.slice();
    const shuffled = buildNumberDeck().shuffle(42).cards;
    expect(shuffled).not.toEqual(ordered);
  });

  it('returns the deck instance for chaining', () => {
    const deck = buildNumberDeck();
    expect(deck.shuffle(7)).toBe(deck);
  });
});
