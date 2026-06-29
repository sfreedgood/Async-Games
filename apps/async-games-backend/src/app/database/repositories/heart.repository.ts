import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { HeartEntity } from '../entities';

@Injectable()
export class HeartRepository {
  constructor(
    @InjectRepository(HeartEntity)
    private readonly repository: Repository<HeartEntity>
  ) {}

  private getRepo(manager?: EntityManager) {
    return manager?.getRepository(HeartEntity) ?? this.repository;
  }

  record(entry: DeepPartial<HeartEntity>, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    const heartEntry = repo.create(entry);
    return repo.save(heartEntry);
  }

  findLatestByGame(gameId: string, manager?: EntityManager) {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { game: { id: gameId } },
      relations: { player: true, game: true },
      order: { createdAt: 'DESC' },
    });
  }
}
