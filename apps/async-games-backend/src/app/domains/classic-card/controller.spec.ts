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
});
