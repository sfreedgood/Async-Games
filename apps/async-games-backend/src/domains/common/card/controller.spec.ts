import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './controller';
import { CardService } from './service';
import { StandardPlayingCard } from '../../../entities/card';

describe('CardController', () => {
  let card: TestingModule;

  beforeAll(async () => {
    card = await Test.createTestingModule({
      controllers: [CardController],
      providers: [CardService],
    }).compile();
  });

  describe('getData', () => {
    it('should return card matching input value', () => {
      const cardController = card.get<CardController>(CardController);
      const testCard = cardController.getCard('3', 'heart');
      expect(testCard).toBeInstanceOf(StandardPlayingCard);
      expect(testCard.name).toBe('3');
      expect(testCard.value).toBe(3);
      expect(testCard.type).toBe('heart');
      expect(testCard.color).toBe('red');
      expect(testCard.getAsDTO()).toMatchObject(
        new StandardPlayingCard('3', 'heart').getAsDTO()
      );
    });
  });
});
