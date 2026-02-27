import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository, QueryDeepPartialEntity } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) {}

  private getRepo(manager?: EntityManager) {
    return manager?.getRepository(UserEntity) ?? this.repository;
  }

  findAll(manager?: EntityManager) {
    return this.getRepo(manager).find();
  }

  create(createInput: DeepPartial<UserEntity>, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    const user = repo.create(createInput);
    return repo.save(user);
  }

  findById(id: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    return repo.findOne({ where: { id } });
  }

  findByEmail(email: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    return repo.findOne({ where: { email } });
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

  remove(id: string, manager?: EntityManager) {
    return this.getRepo(manager).delete(id);
  }

  async disableUser(id: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    await repo.update(id, { disabled: true });
    return repo.findOne({ where: { id } });
  }
}
