import { UserEntity } from '../../database/entities/user.entity';
import type { User as IUser } from './user.interface';

/**
 * Domain model for a User.
 * Mirrors UserEntity but omits sensitive fields (e.g. passwordHash).
 */
export class User implements IUser {
  id!: string;
  username!: string;
  email!: string;
  fullName?: string;
  emailVerified!: boolean;
  avatarUrl?: string;
  locale!: string;
  language!: string;
  timezone!: string;
  createdAt!: Date;
  updatedAt!: Date;
  disabled!: boolean;
  meta!: Record<string, unknown>;

  /** Map a TypeORM UserEntity to a safe User domain object. */
  static fromEntity(entity: UserEntity): User {
    const user = new User();
    user.id = entity.id;
    user.username = entity.username;
    user.email = entity.email;
    user.fullName = entity.fullName;
    user.emailVerified = entity.emailVerified;
    user.avatarUrl = entity.avatarUrl;
    user.locale = entity.locale;
    user.language = entity.language;
    user.timezone = entity.timezone;
    user.createdAt = entity.createdAt;
    user.updatedAt = entity.updatedAt;
    user.disabled = entity.disabled;
    user.meta = entity.meta;
    return user;
  }
}
