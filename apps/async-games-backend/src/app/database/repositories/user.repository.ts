import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryDeepPartialEntity, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>
  ) {
    super(repository);
  }

  findByEmail(email: string, manager?: EntityManager) {
    return this.getRepo(manager).findOne({ where: { email } });
  }

  findByUsername(username: string, manager?: EntityManager) {
    return this.getRepo(manager).findOne({ where: { username } });
  }

  async update(
    id: string,
    updateInput: QueryDeepPartialEntity<UserEntity>,
    manager?: EntityManager
  ) {
    const repo = this.getRepo(manager);
    await repo.update(id, updateInput);
    return repo.findOne({ where: { id } });
  }

  async disableUser(id: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    await repo.update(id, { disabled: true });
    return repo.findOne({ where: { id } });
  }
}
