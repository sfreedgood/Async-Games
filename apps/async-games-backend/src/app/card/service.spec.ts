import { Test } from '@nestjs/testing';
import { CardService } from './service';
import { StandardPlayingCard } from './card.entity';

describe('CardService', () => {
  let service: CardService;

  beforeAll(async () => {
    const card = await Test.createTestingModule({
      providers: [CardService],
    }).compile();

    service = card.get<CardService>(CardService);
  });

  // describe('getCardData', () => {
  //   it('should return "Hello API"', () => {
  //     expect(service.getData()).toEqual({ message: 'Hello API' });
  //   });
  // });

  describe('getAllCardsInDeck', () => {
    it('should return 52 cards by default', () => {
      expect(service.getAllCardsInDeck()).toHaveLength(52);
    });

    it('should allow the user to add Jokers to the deck', () => {
      const deck = service.getAllCardsInDeck({ jokers: 2 });
      expect(deck).toHaveLength(54);
      expect(deck).toContainEqual(new StandardPlayingCard('joker', 'joker'));
    });
  });
});
