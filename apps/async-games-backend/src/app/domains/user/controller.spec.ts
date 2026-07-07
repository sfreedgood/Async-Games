// Mock the repository to keep this a pure unit test of UserController.
jest.mock('../../database/repositories/user.repository', () => ({
  UserRepository: jest.fn(),
}));
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './controller';
import { UserService } from './service';
import { User } from './user.entity';
import { UserResponseDTO } from './user.dto';

const makeUser = (overrides: Partial<User> = {}): User =>
  Object.assign(new User(), {
    id: 'uuid-1',
    username: 'alice',
    email: 'alice@example.com',
    fullName: 'Alice',
    emailVerified: false,
    locale: 'en-US',
    language: 'en',
    timezone: 'UTC',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    disabled: false,
    meta: {},
    ...overrides,
  });

const mockedUserService = (): jest.Mocked<UserService> =>
  ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  }) as unknown as jest.Mocked<UserService>;

describe('UserController', () => {
  let mockUserController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockUserModule: TestingModule;

  beforeEach(async () => {
    mockUserService = mockedUserService();
    mockUserModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();
    mockUserController = mockUserModule.get<UserController>(UserController);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('getAllUsers', () => {
    it('returns an array of users from the service', async () => {
      mockUserService.getAllUsers.mockResolvedValue([makeUser()]);
      const result = await mockUserController.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('alice');
    });
  });

  describe('getUserById', () => {
    it('returns a user for a valid id', async () => {
      mockUserService.getUserById.mockResolvedValue(makeUser());
      const result = await mockUserController.getUserById('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('propagates NotFoundException from service', async () => {
      mockUserService.getUserById.mockRejectedValue(new NotFoundException());
      await expect(mockUserController.getUserById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('delegates to service and returns created user', async () => {
      const user = makeUser();
      mockUserService.createUser.mockResolvedValue(user);
      const result = await mockUserController.createUser({
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret',
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'alice' })
      );
      // Controller maps the domain User to a UserResponseDTO instance, so it is
      // structurally equal to (but not the same reference as) the service result.
      expect(result).toBeInstanceOf(UserResponseDTO);
      expect(result).toEqual(user);
    });
  });

  describe('updateUser', () => {
    it('delegates to service with id and body', async () => {
      const updated = makeUser({ username: 'bob' });
      mockUserService.updateUser.mockResolvedValue(updated);
      const result = await mockUserController.updateUser('uuid-1', {
        username: 'bob',
      });
      expect(mockUserService.updateUser).toHaveBeenCalledWith('uuid-1', { username: 'bob' });
      expect(result.username).toBe('bob');
    });
  });

  describe('deleteUser', () => {
    it('calls service.deleteUser with the given id', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined);
      await mockUserController.deleteUser('uuid-1');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('uuid-1');
    });
  });
});

