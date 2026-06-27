// Factory mock breaks the active-game.entity <-> heart.entity circular dep in Jest's module resolver.
jest.mock('../entities/heart.entity', () => {
  class HeartEntity {}
  return { HeartEntity };
});

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActiveGameEntity } from '../entities';
import { ActiveGameRepository } from './active-game.repository';

const makeEntity = (overrides = {}): ActiveGameEntity =>
  ({
    id: 'game-uuid-1',
    name: 'Test Game',
    type: 'hearts',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    hearts: [],
    ...overrides,
  } as ActiveGameEntity);

const makeTypeOrmRepo = (): jest.Mocked<Repository<ActiveGameEntity>> =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<ActiveGameEntity>>);

describe('ActiveGameRepository', () => {
  let activeGameRepo: ActiveGameRepository;
  let typeOrmRepo: jest.Mocked<Repository<ActiveGameEntity>>;

  beforeEach(async () => {
    typeOrmRepo = makeTypeOrmRepo();
    const module = await Test.createTestingModule({
      providers: [
        ActiveGameRepository,
        {
          provide: getRepositoryToken(ActiveGameEntity),
          useValue: typeOrmRepo,
        },
      ],
    }).compile();
    activeGameRepo = module.get<ActiveGameRepository>(ActiveGameRepository);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('create', () => {
    it('creates and saves an active game', async () => {
      const entity = makeEntity();
      typeOrmRepo.create.mockReturnValue(entity);
      typeOrmRepo.save.mockResolvedValue(entity);

      const result = await activeGameRepo.create({ name: 'Test Game', type: 'hearts' });

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

      await activeGameRepo.create({ name: 'Test Game' }, manager);
      expect(manager.getRepository).toHaveBeenCalledWith(ActiveGameEntity);
    });
  });

  describe('findById', () => {
    it('returns the game with hearts relation when found', async () => {
      const entity = makeEntity();
      typeOrmRepo.findOne.mockResolvedValue(entity);

      const result = await activeGameRepo.findById('game-uuid-1');
      expect(typeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'game-uuid-1' },
        relations: { hearts: true },
      });
      expect(result).toEqual(entity);
    });

    it('returns null when not found', async () => {
      typeOrmRepo.findOne.mockResolvedValue(null);
      const result = await activeGameRepo.findById('bad-id');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns games ordered by createdAt DESC', async () => {
      const entities = [makeEntity({ id: 'game-2' }), makeEntity({ id: 'game-1' })];
      typeOrmRepo.find.mockResolvedValue(entities);

      const result = await activeGameRepo.list();
      expect(typeOrmRepo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });

    it('uses provided EntityManager', async () => {
      const mockManagerRepo = makeTypeOrmRepo();
      mockManagerRepo.find.mockResolvedValue([makeEntity()]);
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;

      await activeGameRepo.list(manager);
      expect(manager.getRepository).toHaveBeenCalledWith(ActiveGameEntity);
      expect(mockManagerRepo.find).toHaveBeenCalled();
    });
  });
});
