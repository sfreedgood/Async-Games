import { UserEntity } from '../../../database/entities';
import { User } from './user.entity';

const makeEntity = (overrides: Partial<UserEntity> = {}): UserEntity =>
  ({
    id: 'uuid-1',
    username: 'alice',
    email: 'alice@example.com',
    passwordHash: 'hash',
    fullName: 'Alice Doe',
    emailVerified: true,
    avatarUrl: 'https://example.com/avatar.png',
    locale: 'en-US',
    language: 'en',
    timezone: 'UTC',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    disabled: false,
    meta: { theme: 'dark' },
    ...overrides,
  }) as UserEntity;

describe('User', () => {
  describe('fromEntity', () => {
    it('maps all fields from UserEntity', () => {
      const entity = makeEntity();
      const user = User.fromEntity(entity);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(entity.id);
      expect(user.username).toBe(entity.username);
      expect(user.email).toBe(entity.email);
      expect(user.fullName).toBe(entity.fullName);
      expect(user.emailVerified).toBe(entity.emailVerified);
      expect(user.avatarUrl).toBe(entity.avatarUrl);
      expect(user.locale).toBe(entity.locale);
      expect(user.language).toBe(entity.language);
      expect(user.timezone).toBe(entity.timezone);
      expect(user.createdAt).toBe(entity.createdAt);
      expect(user.updatedAt).toBe(entity.updatedAt);
      expect(user.disabled).toBe(entity.disabled);
      expect(user.meta).toEqual(entity.meta);
    });

    it('does NOT expose passwordHash', () => {
      const entity = makeEntity();
      const user = User.fromEntity(entity) as User & { passwordHash?: string };
      expect(user.passwordHash).toBeUndefined();
    });

    it('handles optional fields being undefined', () => {
      const entity = makeEntity({ fullName: undefined, avatarUrl: undefined });
      const user = User.fromEntity(entity);
      expect(user.fullName).toBeUndefined();
      expect(user.avatarUrl).toBeUndefined();
    });
  });
});

