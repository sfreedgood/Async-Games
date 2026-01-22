import { Deck } from './deck';

class NumberDeck extends Deck<number> {
  constructor(cards: number[]) {
    super(cards);
  }
}

describe('Deck', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shuffles cards using Fisher-Yates algorithm', () => {
    const deck = new NumberDeck([1, 2, 3, 4]);
    const randomValues = [0.1, 0.6, 0.3];
    let callIndex = 0;
    jest
      .spyOn(Math, 'random')
      .mockImplementation(
        () => randomValues[callIndex++] ?? randomValues[randomValues.length - 1]
      );

    const shuffled = deck.shuffle();

    expect(shuffled).toEqual([3, 4, 2, 1]);
    expect(deck.cards).toEqual([3, 4, 2, 1]);
    expect(Math.random).toHaveBeenCalledTimes(deck.cards.length - 1);
  });
});
