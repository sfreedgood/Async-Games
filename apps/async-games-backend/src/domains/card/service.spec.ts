import { Test } from '@nestjs/testing';
import { CardService } from './service';

describe('CardService', () => {
  let service: CardService;

  beforeAll(async () => {
    const card = await Test.createTestingModule({
      providers: [CardService],
    }).compile();

    service = card.get<CardService>(CardService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
