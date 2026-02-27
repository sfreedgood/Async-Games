import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { ActiveGameEntity } from '../entities';

@Injectable()
export class ActiveGameRepository {
  constructor(
    @InjectRepository(ActiveGameEntity)
    private readonly repository: Repository<ActiveGameEntity>
  ) {}

  private getRepo(manager?: EntityManager) {
    return manager?.getRepository(ActiveGameEntity) ?? this.repository;
  }

  create(createInput: DeepPartial<ActiveGameEntity>, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    const game = repo.create(createInput);
    return repo.save(game);
  }

  findById(id: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    return repo.findOne({ where: { id }, relations: { hearts: true } });
  }

  list(manager?: EntityManager) {
    const repo = this.getRepo(manager);
    return repo.find({ order: { createdAt: 'DESC' } });
  }

  findAll(manager?: EntityManager) {
    return this.getRepo(manager).find();
  }

  count(manager?: EntityManager) {
    return this.getRepo(manager).count();
  }
}
