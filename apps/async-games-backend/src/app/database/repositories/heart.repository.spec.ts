// Factory mocks break the circular deps between heart, user, and active-game entities
// in Jest's module resolver.
jest.mock('../entities/user.entity', () => {
  class UserEntity {}
  return { UserEntity };
});

jest.mock('../entities/active-game.entity', () => {
  class ActiveGameEntity {}
  return { ActiveGameEntity };
});

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HeartEntity } from '../entities';
import { HeartRepository } from './heart.repository';

const makeEntity = (overrides = {}): HeartEntity =>
  ({
    id: 'heart-uuid-1',
    game: { id: 'game-uuid-1' } as any,
    player: { id: 'user-uuid-1' } as any,
    handNumber: 1,
    playerHand: [],
    trick: 0,
    initiative: false,
    cardSuit: undefined,
    cardName: undefined,
    pointsTaken: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    ...overrides,
  } as HeartEntity);

const makeTypeOrmRepo = (): jest.Mocked<Repository<HeartEntity>> =>
  ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<HeartEntity>>);

describe('HeartRepository', () => {
  let heartRepo: HeartRepository;
  let typeOrmRepo: jest.Mocked<Repository<HeartEntity>>;

  beforeEach(async () => {
    typeOrmRepo = makeTypeOrmRepo();
    const module = await Test.createTestingModule({
      providers: [
        HeartRepository,
        {
          provide: getRepositoryToken(HeartEntity),
          useValue: typeOrmRepo,
        },
      ],
    }).compile();
    heartRepo = module.get<HeartRepository>(HeartRepository);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('record', () => {
    it('creates and saves a heart entry', async () => {
      const entity = makeEntity();
      typeOrmRepo.create.mockReturnValue(entity);
      typeOrmRepo.save.mockResolvedValue(entity);

      const result = await heartRepo.record({
        game: { id: 'game-uuid-1' } as any,
        player: { id: 'user-uuid-1' } as any,
        handNumber: 1,
        trick: 0,
      });

      expect(typeOrmRepo.create).toHaveBeenCalled();
      expect(typeOrmRepo.save).toHaveBeenCalled();
      expect(result).toEqual(entity);
    });

    it('uses provided EntityManager', async () => {
      const entity = makeEntity();
      const mockManagerRepo = makeTypeOrmRepo();
      mockManagerRepo.create.mockReturnValue(entity);
      mockManagerRepo.save.mockResolvedValue(entity);
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;

      await heartRepo.record({ handNumber: 1 }, manager);
      expect(manager.getRepository).toHaveBeenCalledWith(HeartEntity);
    });
  });

  describe('findLatestByGame', () => {
    it('returns the latest heart entry with relations when found', async () => {
      const entity = makeEntity();
      typeOrmRepo.findOne.mockResolvedValue(entity);

      const result = await heartRepo.findLatestByGame('game-uuid-1');
      expect(typeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { game: { id: 'game-uuid-1' } },
        relations: { player: true, game: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(entity);
    });

    it('returns null when no entry exists', async () => {
      typeOrmRepo.findOne.mockResolvedValue(null);
      const result = await heartRepo.findLatestByGame('no-game');
      expect(result).toBeNull();
    });

    it('uses provided EntityManager', async () => {
      const mockManagerRepo = makeTypeOrmRepo();
      mockManagerRepo.findOne.mockResolvedValue(makeEntity());
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;

      await heartRepo.findLatestByGame('game-uuid-1', manager);
      expect(manager.getRepository).toHaveBeenCalledWith(HeartEntity);
    });
  });
});
