import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './controller';
import { CardService } from './service';
import { StandardPlayingCard } from './card.entity';

describe('CardController', () => {
  let card: TestingModule;

  beforeAll(async () => {
    card = await Test.createTestingModule({
      controllers: [CardController],
      providers: [CardService],
    }).compile();
  });

  describe('getData', () => {
    it('should return card matching input value', async () => {
      const cardController = card.get<CardController>(CardController);
      const testCard = await cardController.findOne('3,heart');
      expect(testCard).toBeInstanceOf(StandardPlayingCard);
      expect(testCard.name).toBe('3');
      expect(testCard.value).toBe(3);
      expect(testCard.suit).toBe('heart');
      expect(testCard.color).toBe('red');
    });
  });
});
