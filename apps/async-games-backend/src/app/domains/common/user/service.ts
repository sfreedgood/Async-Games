import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { UserRepository } from '../../../database/repositories/user.repository';
import { User } from './user.entity';
import { validateCreateUser, validateUpdateUser } from './user.validator';
import type { CreateUserInput, UpdateUserInput } from './user.interface';

// TODO: replace with bcrypt once installed
function hashPassword(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

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
    const entity = await this.userRepository.create({
      username: validated.username,
      email: validated.email,
      passwordHash: hashPassword(validated.password),
      fullName: validated.fullName,
      locale: validated.locale,
      language: validated.language,
      timezone: validated.timezone,
      meta: validated.meta,
    });
    return User.fromEntity(entity);
  }

  async updateUser(
    id: string,
    input: Partial<UpdateUserInput>
  ): Promise<User> {
    validateUpdateUser(input);
    const { password, ...rest } = input;
    const updateData: Record<string, unknown> = { ...rest };
    if (password) {
      updateData['passwordHash'] = hashPassword(password);
    }
    const entity = await this.userRepository.update(id, updateData);
    if (!entity) throw new NotFoundException(`User '${id}' not found`);
    return User.fromEntity(entity);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.remove(id);
  }
}
