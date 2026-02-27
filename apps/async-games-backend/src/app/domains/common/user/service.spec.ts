// Factory mock prevents user.repository.ts from loading and triggering the
// user.entity <-> heart.entity circular dep in Jest's module resolver.
jest.mock('../../../database/repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  })),
}));

import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRepository } from '../../../database/repositories/user.repository';
import { UserService } from './service';
import { User } from './user.entity';

const makeEntity = (overrides = {}) =>
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
  }) as any;

const mockRepo = (): jest.Mocked<UserRepository> => {
  const repo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  return repo as unknown as jest.Mocked<UserRepository>;
};

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    repo = mockRepo();
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repo },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('getAllUsers', () => {
    it('returns mapped User domain objects', async () => {
      repo.findAll.mockResolvedValue([makeEntity()]);
      const result = await service.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].username).toBe('alice');
    });
  });

  describe('getUserById', () => {
    it('returns a User for a known id', async () => {
      repo.findById.mockResolvedValue(makeEntity());
      const result = await service.getUserById('uuid-1');
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException for unknown id', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getUserById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('hashes the password and saves via repository', async () => {
      const entity = makeEntity();
      repo.create.mockResolvedValue(entity);
      const result = await service.createUser({
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret',
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'alice',
          email: 'alice@example.com',
          passwordHash: expect.any(String),
        })
      );
      expect(result).toBeInstanceOf(User);
    });

    it('throws when required fields are missing', async () => {
      await expect(
        service.createUser({ username: 'alice' })
      ).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('updates the user and returns the updated domain object', async () => {
      const entity = makeEntity({ username: 'bob' });
      repo.update.mockResolvedValue(entity);
      const result = await service.updateUser('uuid-1', { username: 'bob' });
      expect(repo.update).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({ username: 'bob' })
      );
      expect(result.username).toBe('bob');
    });

    it('hashes a new password when provided', async () => {
      repo.update.mockResolvedValue(makeEntity());
      await service.updateUser('uuid-1', { password: 'newpass' });
      expect(repo.update).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({ passwordHash: expect.any(String) })
      );
    });

    it('throws NotFoundException when entity is not found after update', async () => {
      repo.update.mockResolvedValue(null);
      await expect(
        service.updateUser('bad-id', { username: 'x' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('calls repository remove with the given id', async () => {
      repo.remove.mockResolvedValue({ affected: 1, raw: {} });
      await service.deleteUser('uuid-1');
      expect(repo.remove).toHaveBeenCalledWith('uuid-1');
    });
  });
});

