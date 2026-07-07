// Stub the entities barrel so the real circular-importing entity files aren't
// evaluated by Jest's loader (they TDZ-crash); the repository only needs the
// class as a TypeORM target.
jest.mock('../entities', () => ({ ActiveGameEntity: class ActiveGameEntity {} }));

import { Repository } from 'typeorm';
import { ActiveGameEntity } from '../entities';
import { ActiveGameRepository } from './active-game.repository';

const makeRepo = () =>
  ({
    target: ActiveGameEntity,
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((input) => input),
    save: jest.fn((entity) => Promise.resolve(entity)),
  }) as unknown as jest.Mocked<Repository<ActiveGameEntity>>;

describe('ActiveGameRepository', () => {
  let repo: jest.Mocked<Repository<ActiveGameEntity>>;
  let activeGameRepository: ActiveGameRepository;

  beforeEach(() => {
    repo = makeRepo();
    activeGameRepository = new ActiveGameRepository(repo);
  });

  describe('findById', () => {
    it('eager-loads the hearts relation', async () => {
      await activeGameRepository.findById('game-1');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'game-1' },
        relations: { hearts: true },
      });
    });
  });

  describe('list', () => {
    it('returns games newest-first', async () => {
      await activeGameRepository.list();
      expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });
});
