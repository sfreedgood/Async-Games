import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../database/repositories/user.repository';
import { isUniqueViolation } from '../../../utils/error.utils';
import { User } from './user.entity';
import { validateCreateUser, validateUpdateUser } from './user.validator';
import type { CreateUserInput, UpdateUserInput } from './user.interface';

// Work factor for bcrypt. 12 balances hashing cost against resistance to
// offline brute-force; raise as hardware improves.
const BCRYPT_ROUNDS = 12;

// Salted, work-factored hash suitable for password storage. Returns a promise
// so the bcrypt cost is computed off the main synchronous path.
function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Fields a client is allowed to change via updateUser. Privileged columns
// (emailVerified, disabled) are deliberately excluded so they cannot be set
// through the public update endpoint (no mass-assignment).
const UPDATABLE_FIELDS = [
  'username',
  'email',
  'fullName',
  'avatarUrl',
  'locale',
  'language',
  'timezone',
  'meta',
] as const;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    const entities = await this.userRepository.findAll();
    return entities.map(User.fromEntity);
  }

  async getUserById(id: string): Promise<User> {
    const entity = await this.userRepository.findById(id);
    if (!entity) throw new NotFoundException(`User '${id}' not found`);
    return User.fromEntity(entity);
  }

  async createUser(input: Partial<CreateUserInput>): Promise<User> {
    const validated = validateCreateUser(input);

    const [existingUsername, existingEmail] = await Promise.all([
      this.userRepository.findByUsername(validated.username),
      this.userRepository.findByEmail(validated.email),
    ]);
    if (existingUsername) {
      throw new ConflictException(`Username '${validated.username}' is already taken`);
    }
    if (existingEmail) {
      throw new ConflictException(`Email '${validated.email}' is already registered`);
    }

    try {
      const entity = await this.userRepository.create({
        username: validated.username,
        email: validated.email,
        passwordHash: await hashPassword(validated.password),
        fullName: validated.fullName,
        locale: validated.locale,
        language: validated.language,
        timezone: validated.timezone,
        meta: validated.meta,
      });
      return User.fromEntity(entity);
    } catch (error) {
      // The pre-checks above are best-effort; the DB unique constraints are the
      // authoritative guard. Two concurrent requests can both pass the checks
      // and race to insert — map that 23505 to a 409 instead of leaking a 500.
      if (isUniqueViolation(error)) {
        throw new ConflictException('Username or email is already in use');
      }
      throw error;
    }
  }

  async updateUser(
    id: string,
    input: Partial<UpdateUserInput>
  ): Promise<User> {
    validateUpdateUser(input);

    const [existingUsername, existingEmail] = await Promise.all([
      input.username !== undefined
        ? this.userRepository.findByUsername(input.username)
        : Promise.resolve(null),
      input.email !== undefined
        ? this.userRepository.findByEmail(input.email)
        : Promise.resolve(null),
    ]);
    if (existingUsername && existingUsername.id !== id) {
      throw new ConflictException(`Username '${input.username}' is already taken`);
    }
    if (existingEmail && existingEmail.id !== id) {
      throw new ConflictException(`Email '${input.email}' is already registered`);
    }

    // Copy only explicitly allowed fields; never trust the raw input shape.
    const updateData: Record<string, unknown> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (input[field] !== undefined) {
        updateData[field] = input[field];
      }
    }
    if (input.password) {
      updateData['passwordHash'] = await hashPassword(input.password);
    }
    try {
      const entity = await this.userRepository.update(id, updateData);
      if (!entity) throw new NotFoundException(`User '${id}' not found`);
      return User.fromEntity(entity);
    } catch (error) {
      // As in createUser, the unique constraint is the authoritative guard for
      // a concurrent username/email collision.
      if (isUniqueViolation(error)) {
        throw new ConflictException('Username or email is already in use');
      }
      throw error;
    }
  }

  // Soft delete: flag the user as disabled rather than removing the row, so the
  // user's hearts history (FK ON DELETE CASCADE) is preserved. Reads are left
  // unfiltered — a disabled user is still fetchable by id.
  async deleteUser(id: string): Promise<void> {
    const entity = await this.userRepository.disableUser(id);
    if (!entity) throw new NotFoundException(`User '${id}' not found`);
  }
}
