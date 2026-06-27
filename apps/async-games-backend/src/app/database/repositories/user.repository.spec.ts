// Factory mock breaks the user.entity <-> heart.entity circular dep in Jest's module resolver.
jest.mock('../entities/heart.entity', () => {
  class HeartEntity {}
  return { HeartEntity };
});

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from './user.repository';

const makeEntity = (overrides = {}): UserEntity =>
  ({
    id: 'uuid-1',
    username: 'alice',
    email: 'alice@example.com',
    passwordHash: 'hash',
    fullName: 'Alice',
    emailVerified: false,
    avatarUrl: undefined,
    locale: 'en-US',
    language: 'en',
    timezone: 'UTC',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    disabled: false,
    meta: {},
    ...overrides,
  } as UserEntity);

const makeTypeOrmRepo = (): jest.Mocked<Repository<UserEntity>> =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<UserEntity>>);

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let typeOrmRepo: jest.Mocked<Repository<UserEntity>>;

  beforeEach(async () => {
    typeOrmRepo = makeTypeOrmRepo();
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: typeOrmRepo,
        },
      ],
    }).compile();
    userRepo = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('findAll', () => {
    it('returns all users', async () => {
      typeOrmRepo.find.mockResolvedValue([makeEntity()]);
      const result = await userRepo.findAll();
      expect(typeOrmRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('uses provided EntityManager', async () => {
      const mockManagerRepo = makeTypeOrmRepo();
      mockManagerRepo.find.mockResolvedValue([makeEntity()]);
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;

      await userRepo.findAll(manager);
      expect(manager.getRepository).toHaveBeenCalledWith(UserEntity);
      expect(mockManagerRepo.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates and saves a user', async () => {
      const entity = makeEntity();
      typeOrmRepo.create.mockReturnValue(entity);
      typeOrmRepo.save.mockResolvedValue(entity);

      const result = await userRepo.create({
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
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

      await userRepo.create({ username: 'alice' }, manager);
      expect(manager.getRepository).toHaveBeenCalledWith(UserEntity);
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const entity = makeEntity();
      typeOrmRepo.findOne.mockResolvedValue(entity);
      const result = await userRepo.findById('uuid-1');
      expect(typeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(entity);
    });

    it('returns null when not found', async () => {
      typeOrmRepo.findOne.mockResolvedValue(null);
      const result = await userRepo.findById('bad-id');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      const entity = makeEntity();
      typeOrmRepo.findOne.mockResolvedValue(entity);
      const result = await userRepo.findByEmail('alice@example.com');
      expect(typeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'alice@example.com' },
      });
      expect(result).toEqual(entity);
    });

    it('returns null when not found', async () => {
      typeOrmRepo.findOne.mockResolvedValue(null);
      const result = await userRepo.findByEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and returns the updated user', async () => {
      const updated = makeEntity({ username: 'bob' });
      typeOrmRepo.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      typeOrmRepo.findOne.mockResolvedValue(updated);

      const result = await userRepo.update('uuid-1', { username: 'bob' });
      expect(typeOrmRepo.update).toHaveBeenCalledWith('uuid-1', {
        username: 'bob',
      });
      expect(result?.username).toBe('bob');
    });

    it('uses provided EntityManager', async () => {
      const mockManagerRepo = makeTypeOrmRepo();
      mockManagerRepo.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      mockManagerRepo.findOne.mockResolvedValue(makeEntity());
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;

      await userRepo.update('uuid-1', { username: 'bob' }, manager);
      expect(manager.getRepository).toHaveBeenCalledWith(UserEntity);
    });
  });

  describe('remove', () => {
    it('deletes the user by id', async () => {
      typeOrmRepo.delete.mockResolvedValue({ affected: 1, raw: {} } as any);
      await userRepo.remove('uuid-1');
      expect(typeOrmRepo.delete).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('disableUser', () => {
    it('sets disabled=true and returns the updated user', async () => {
      const entity = makeEntity({ disabled: true });
      typeOrmRepo.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      typeOrmRepo.findOne.mockResolvedValue(entity);

      const result = await userRepo.disableUser('uuid-1');
      expect(typeOrmRepo.update).toHaveBeenCalledWith('uuid-1', {
        disabled: true,
      });
      expect(result?.disabled).toBe(true);
    });
  });
});
