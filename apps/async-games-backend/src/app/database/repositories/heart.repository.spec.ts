// Stub the entities barrel so the real circular-importing entity files aren't
// evaluated by Jest's loader (they TDZ-crash); the repository only needs the
// class as a TypeORM target.
jest.mock('../entities', () => ({ HeartEntity: class HeartEntity {} }));

import { Repository } from 'typeorm';
import { HeartEntity } from '../entities';
import { HeartRepository } from './heart.repository';

const makeRepo = () =>
  ({
    target: HeartEntity,
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((input) => input),
    save: jest.fn((entity) => Promise.resolve(entity)),
  }) as unknown as jest.Mocked<Repository<HeartEntity>>;

describe('HeartRepository', () => {
  let repo: jest.Mocked<Repository<HeartEntity>>;
  let heartRepository: HeartRepository;

  beforeEach(() => {
    repo = makeRepo();
    heartRepository = new HeartRepository(repo);
  });

  describe('record', () => {
    it('creates and saves the entry', async () => {
      const entry = { handNumber: 1, trick: 0 };
      await heartRepository.record(entry);
      expect(repo.create).toHaveBeenCalledWith(entry);
      expect(repo.save).toHaveBeenCalledWith(entry);
    });
  });

  describe('findLatestByGame', () => {
    it('fetches the most recent row for the game with its relations', async () => {
      await heartRepository.findLatestByGame('game-1');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { game: { id: 'game-1' } },
        relations: { player: true, game: true },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
