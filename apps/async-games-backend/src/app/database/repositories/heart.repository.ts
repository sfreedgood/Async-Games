import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { HeartEntity } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class HeartRepository extends BaseRepository<HeartEntity> {
  constructor(
    @InjectRepository(HeartEntity)
    repository: Repository<HeartEntity>
  ) {
    super(repository);
  }

  record(entry: DeepPartial<HeartEntity>, manager?: EntityManager) {
    return this.create(entry, manager);
  }

  findLatestByGame(gameId: string, manager?: EntityManager) {
    return this.getRepo(manager).findOne({
      where: { game: { id: gameId } },
      relations: { player: true, game: true },
      order: { createdAt: 'DESC' },
    });
  }
}
