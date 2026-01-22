import { Test } from '@nestjs/testing';
import { ClassicCardService } from './service';
import { ClassicDeck, ClassicPlayingCard } from './classic-card.entity';

describe('ClassicCardService', () => {
  let service: ClassicCardService;

  beforeAll(async () => {
    const card = await Test.createTestingModule({
      providers: [ClassicCardService],
    }).compile();

    service = card.get<ClassicCardService>(ClassicCardService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      expect(deck).toContainEqual(new ClassicPlayingCard('joker', 'joker'));
    });
  });

  describe('shuffle', () => {
    it('returns shuffled deck from ClassicDeck', () => {
      const mockCards = [
        new ClassicPlayingCard('A', 'spade'),
        new ClassicPlayingCard('K', 'heart'),
      ];
      const shuffleSpy = jest
        .spyOn(ClassicDeck.prototype, 'shuffle')
        .mockReturnValue(mockCards);

      const shuffled = service.shuffle('deck-123');

      expect(shuffled).toEqual(mockCards);
      expect(shuffleSpy).toHaveBeenCalledTimes(1);
    });
  });
});
