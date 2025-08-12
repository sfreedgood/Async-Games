import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './controller';
import { CardService } from './service';

describe('CardController', () => {
  let card: TestingModule;

  beforeAll(async () => {
    card = await Test.createTestingModule({
      controllers: [CardController],
      providers: [CardService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const cardController = card.get<CardController>(CardController);
      expect(cardController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
