import { Test, TestingModule } from '@nestjs/testing';
import { ClassicCardController } from './controller';
import { ClassicCardService } from './service';
import { ClassicPlayingCard } from './classic-card.entity';

describe('ClassicCardController', () => {
  let card: TestingModule;

  beforeAll(async () => {
    card = await Test.createTestingModule({
      controllers: [ClassicCardController],
      providers: [ClassicCardService],
    }).compile();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getData', () => {
    it('should return card matching input value', async () => {
      const classicCardController = card.get<ClassicCardController>(
        ClassicCardController
      );
      const testCard = await classicCardController.findOne('3,heart');
      expect(testCard).toBeInstanceOf(ClassicPlayingCard);
      expect(testCard.name).toBe('3');
      expect(testCard.value).toBe(3);
      expect(testCard.suit).toBe('heart');
      expect(testCard.color).toBe('red');
    });
  });

  describe('shuffleDeck', () => {
    it('should delegate shuffle to service', () => {
      const classicCardController = card.get<ClassicCardController>(
        ClassicCardController
      );
      const service = card.get<ClassicCardService>(ClassicCardService);
      const shuffled = [new ClassicPlayingCard('A', 'spade')];
      const shuffleSpy = jest
        .spyOn(service, 'shuffle')
        .mockReturnValue(shuffled);

      const response = classicCardController.shuffleDeck({ id: 'deck-1' });

      expect(response).toEqual(shuffled);
      expect(shuffleSpy).toHaveBeenCalledWith('deck-1');
    });
  });
});
