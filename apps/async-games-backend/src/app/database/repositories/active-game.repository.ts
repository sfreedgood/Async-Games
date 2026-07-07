import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActiveGameEntity } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class ActiveGameRepository extends BaseRepository<ActiveGameEntity> {
  constructor(
    @InjectRepository(ActiveGameEntity)
    repository: Repository<ActiveGameEntity>
  ) {
    super(repository);
  }

  // Eager-load the hearts history when fetching a single game.
  override findById(id: string, manager?: EntityManager) {
    return this.getRepo(manager).findOne({
      where: { id },
      relations: { hearts: true },
    });
  }

  list(manager?: EntityManager) {
    return this.getRepo(manager).find({ order: { createdAt: 'DESC' } });
  }
}
