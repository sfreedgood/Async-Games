// Mock the repository so this stays a pure unit test of UserService (no entity
// metadata / DB wiring loaded).
jest.mock('../../database/repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    disableUser: jest.fn(),
  })),
}));

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRepository } from '../../database/repositories/user.repository';
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
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    disableUser: jest.fn(),
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
      repo.findByUsername.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(null);
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

    it('throws ConflictException when username already exists', async () => {
      repo.findByUsername.mockResolvedValue(makeEntity());
      repo.findByEmail.mockResolvedValue(null);
      await expect(
        service.createUser({ username: 'alice', email: 'alice@example.com', password: 'secret' })
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when email already exists', async () => {
      repo.findByUsername.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(makeEntity());
      await expect(
        service.createUser({ username: 'alice', email: 'alice@example.com', password: 'secret' })
      ).rejects.toThrow(ConflictException);
    });

    it('maps a unique-constraint violation race to ConflictException', async () => {
      // Pre-checks pass, but a concurrent insert wins the race and the DB
      // rejects ours with a unique violation (SQLSTATE 23505).
      repo.findByUsername.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockRejectedValue({ code: '23505' });
      await expect(
        service.createUser({ username: 'alice', email: 'alice@example.com', password: 'secret' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUser', () => {
    it('updates the user and returns the updated domain object', async () => {
      const entity = makeEntity({ username: 'bob' });
      repo.findByUsername.mockResolvedValue(null);
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

    it('throws ConflictException when updating to an existing username', async () => {
      repo.findByUsername.mockResolvedValue(makeEntity({ id: 'uuid-other' }));
      await expect(
        service.updateUser('uuid-1', { username: 'alice' })
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when updating to an existing email', async () => {
      repo.findByEmail.mockResolvedValue(makeEntity({ id: 'uuid-other' }));
      await expect(
        service.updateUser('uuid-1', { email: 'alice@example.com' })
      ).rejects.toThrow(ConflictException);
    });

    it('allows updating username to the same value (own record)', async () => {
      const entity = makeEntity({ id: 'uuid-1', username: 'alice' });
      repo.findByUsername.mockResolvedValue(entity);
      repo.update.mockResolvedValue(entity);
      await expect(
        service.updateUser('uuid-1', { username: 'alice' })
      ).resolves.toBeInstanceOf(User);
    });
  });

  describe('deleteUser', () => {
    it('soft-deletes by disabling the user', async () => {
      repo.disableUser.mockResolvedValue(makeEntity({ disabled: true }));
      await service.deleteUser('uuid-1');
      expect(repo.disableUser).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repo.disableUser.mockResolvedValue(null);
      await expect(service.deleteUser('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});

