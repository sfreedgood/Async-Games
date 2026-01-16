import { ClassicCardHand, PlayerHand, SuitSortOrder } from './hand';
import { classicCardSuits, Joker } from '../../classic-card/entities/card';
import type { ClassicCardEntity, ClassicCardName, ClassicCardSuit } from '../../classic-card/entities';
import { PlayerEntity } from './player';

describe('PlayerHand', () => {
  describe('constructor', () => {
    test('constructs with player and cards', () => {
      class ConcreteHand extends PlayerHand<{ value: number }> {}
      const player = { id: 'p1' } as any;
      const cards = [{ value: 1 }, { value: 2 }];
      const hand = new ConcreteHand(player, cards);
      expect(hand.player).toBe(player);
      expect(hand.cards).toBe(cards);
      expect(hand.playedCards).toBeUndefined();
    });
  });

  describe('playCard', () => {
    test('removes a card from cards and pushes it to playedCards when present', () => {
      class ConcreteHand extends PlayerHand<{ id: string, name: string, value: number }> {}
      const player = { id: 'p2' } as any;
      const cardA = { id: 'cardA', name: '10', value: 10 };
      const cardB = { id: 'card2', name: '3', value: 3 };
      const hand = new ConcreteHand(player, [cardA, cardB]);
      hand.playCard(cardA);
      expect(hand.cards).toEqual([cardB]);
      expect(hand.playedCards).toEqual([cardA]);
      // playing same card again (already played) should do nothing
      hand.playCard(cardA);
      expect(hand.cards).toEqual([cardB]);
      expect(hand.playedCards).toEqual([cardA]);
    });

    test('does nothing when card not in hand', () => {
      class ConcreteHand extends PlayerHand<{ id: string, name: string, value: number }> {}
      const player = { id: 'p3' } as any;
      const cardA = { id: 'cardA', name: '1',  value: 1 };
      const cardB = { id: 'card2', name: '2',  value: 2 };
      const notPresent = { id: 'card3', name: 'nope',  value: 999 };
      const hand = new ConcreteHand(player, [cardA, cardB]);
      hand.playCard(notPresent);
      expect(hand.cards).toEqual([cardA, cardB]);
      expect(hand.playedCards).toBeUndefined();
    });
  });

  describe('sortCards (base)', () => {
    test('sorts cards by numeric value ascending', () => {
      class ConcreteHand extends PlayerHand<{ id: string, name: string, value: number }> {}
      const player = { id: 'p4' } as any;
      const cardA = { id: 'cardA', name: '5', value: 5 };
      const cardB = { id: 'cardB', name: '1', value: 1 };
      const cardC = { id: 'cardC', name: '3', value: 3 };
      const hand = new ConcreteHand(player, [cardA, cardB, cardC]);
      const sorted = hand.sortCards([cardA, cardB, cardC]);
      expect(sorted.map((c) => c.value)).toEqual([1, 3, 5]);
    });
  });
});

describe('ClassicCardHand', () => {
  function makeCard(suit: ClassicCardSuit | Joker, value: number): ClassicCardEntity {
    return { id: `${value}of${suit}`, name: `${value}` as ClassicCardName | Joker, suit, value };
  }

  describe('constructor', () => {
    test('constructs and retains provided classic cards', () => {
      const player:PlayerEntity = { id: 'p5', name: 'Player 5' };
      const cards = [makeCard(classicCardSuits.club, 2)];
      const hand = new ClassicCardHand(player, cards);
      expect(hand.player).toBe(player);
      expect(hand.cards).toBe(cards);
    });
  });

  describe('sortCards (override)', () => {
    test('sorts by default suit order then value ascending within suits', () => {
      const player = { id: 'p6', name: 'Player 6' };
      const cards = [
        makeCard(classicCardSuits.heart, 4),
        makeCard(classicCardSuits.club, 3),
        makeCard(classicCardSuits.club, 1),
        makeCard(classicCardSuits.spade, 5),
        makeCard(classicCardSuits.diamond, 2),
      ];
      const hand = new ClassicCardHand(player, cards);
      const sorted = hand.sortCards(cards);
      // default suit order in implementation: club, diamond, spade, heart
      expect(sorted.map((c) => `${c.suit}:${c.value}`)).toEqual([
        `${classicCardSuits.club}:1`,
        `${classicCardSuits.club}:3`,
        `${classicCardSuits.diamond}:2`,
        `${classicCardSuits.spade}:5`,
        `${classicCardSuits.heart}:4`,
      ]);
    });

    test('respects custom suit sort order', () => {
      const player = { id: 'p7', name: 'PLayer 7' };
      const cards = [
        makeCard(classicCardSuits.heart, 10),
        makeCard(classicCardSuits.heart, 12),
        makeCard(classicCardSuits.heart, 3),
        makeCard(classicCardSuits.club, 2),
        makeCard(classicCardSuits.spade, 7),
        makeCard(classicCardSuits.diamond, 5),
      ];
      const hand = new ClassicCardHand(player, cards);
      // custom order: spade, heart, club, diamond
      const customOrder = [
        classicCardSuits.spade,
        classicCardSuits.heart,
        classicCardSuits.club,
        classicCardSuits.diamond,
      ] as any;
      const sorted = hand.sortCards(cards, customOrder);
      expect(sorted.map((c) => `${c.suit}:${c.value}`)).toEqual([
        `${classicCardSuits.spade}:7`,
        `${classicCardSuits.heart}:3`,
        `${classicCardSuits.heart}:10`,
        `${classicCardSuits.heart}:12`,
        `${classicCardSuits.club}:2`,
        `${classicCardSuits.diamond}:5`,
      ]);
    });

    test('handles suit order entries that are falsy (e.g., Joker slot) without throwing', () => {
      const player = { id: 'p8', name: 'Player 8' };
      const cards = [makeCard(classicCardSuits.club, 1), makeCard(classicCardSuits.club, 9), makeCard(classicCardSuits.diamond, 2), makeCard(classicCardSuits.heart, 4), makeCard(classicCardSuits.spade, 9)];
      const expectedOrder = [makeCard(classicCardSuits.club, 1), makeCard(classicCardSuits.club, 9),makeCard(classicCardSuits.heart, 4), makeCard(classicCardSuits.diamond, 2), makeCard(classicCardSuits.spade, 9)]
      const hand = new ClassicCardHand(player, cards);
      // include an undefined entry to simulate optional Joker slot — should be skipped
      const orderWithUndefined: SuitSortOrder = [
        classicCardSuits.club,
        classicCardSuits.heart,
        classicCardSuits.diamond,
        classicCardSuits.spade,
        undefined
      ];
      expect(() => hand.sortCards(cards, orderWithUndefined)).not.toThrow();
      const sorted = hand.sortCards(cards, orderWithUndefined);
      expect(sorted).toEqual(expectedOrder);
    });

    test('handles suit order entries including Joker', () => {
      const player = { id: 'p8', name: 'Player 8' };
      const cards = [makeCard(classicCardSuits.club, 1), makeCard(classicCardSuits.club, 9), makeCard(classicCardSuits.diamond, 2), makeCard(classicCardSuits.heart, 4), makeCard(classicCardSuits.spade, 9), makeCard('Joker', 1)];
      const expectedOrder = [makeCard(classicCardSuits.club, 1), makeCard(classicCardSuits.club, 9),makeCard(classicCardSuits.heart, 4), makeCard(classicCardSuits.diamond, 2), makeCard(classicCardSuits.spade, 9), makeCard('Joker', 1)]
      const hand = new ClassicCardHand(player, cards);
      
      const orderWithJoker: SuitSortOrder = [
        classicCardSuits.club,
        classicCardSuits.heart,
        classicCardSuits.diamond,
        classicCardSuits.spade,
        'Joker'
      ];

      expect(() => hand.sortCards(cards, orderWithJoker)).not.toThrow();
      const sorted = hand.sortCards(cards, orderWithJoker);
      expect(sorted).toEqual(expectedOrder);
    });
  });
});