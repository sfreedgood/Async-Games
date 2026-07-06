// Stub the entity so the real user.entity <-> heart.entity circular import isn't
// evaluated by Jest's loader (which would TDZ-crash); the repository only needs
// the class as a DI token / TypeORM target, not its decorators.
jest.mock('../entities/user.entity', () => ({ UserEntity: class UserEntity {} }));

import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from './user.repository';

const makeRepo = () =>
  ({
    target: UserEntity,
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((input) => input),
    save: jest.fn((entity) => Promise.resolve(entity)),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  }) as unknown as jest.Mocked<Repository<UserEntity>>;

describe('UserRepository', () => {
  let repo: jest.Mocked<Repository<UserEntity>>;
  let userRepository: UserRepository;

  beforeEach(() => {
    repo = makeRepo();
    userRepository = new UserRepository(repo);
  });

  describe('create (BaseRepository)', () => {
    it('creates then saves the entity', async () => {
      const input = { username: 'alice' };
      await userRepository.create(input);
      expect(repo.create).toHaveBeenCalledWith(input);
      expect(repo.save).toHaveBeenCalledWith(input);
    });
  });

  describe('findById (BaseRepository)', () => {
    it('looks up by id', async () => {
      await userRepository.findById('uuid-1');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });
  });

  describe('findAll (BaseRepository)', () => {
    it('delegates to find', async () => {
      await userRepository.findAll();
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findByEmail / findByUsername', () => {
    it('queries by email', async () => {
      await userRepository.findByEmail('a@b.com');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    });

    it('queries by username', async () => {
      await userRepository.findByUsername('alice');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { username: 'alice' } });
    });
  });

  describe('update', () => {
    it('updates then returns the reloaded row', async () => {
      await userRepository.update('uuid-1', { username: 'bob' });
      expect(repo.update).toHaveBeenCalledWith('uuid-1', { username: 'bob' });
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });
  });

  describe('disableUser (soft delete)', () => {
    it('sets disabled=true and returns the reloaded row', async () => {
      await userRepository.disableUser('uuid-1');
      expect(repo.update).toHaveBeenCalledWith('uuid-1', { disabled: true });
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });
  });

  describe('transaction-aware getRepo', () => {
    it('uses the passed EntityManager repository when given one', async () => {
      const txRepo = makeRepo();
      const manager = {
        getRepository: jest.fn().mockReturnValue(txRepo),
      } as unknown as EntityManager;

      await userRepository.create({ username: 'alice' }, manager);

      expect(manager.getRepository).toHaveBeenCalledWith(UserEntity);
      expect(txRepo.save).toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
