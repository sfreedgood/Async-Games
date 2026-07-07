import {
  DeepPartial,
  EntityManager,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

/**
 * Shared repository plumbing: the transaction-aware repository accessor plus the
 * create/findAll/findById operations every entity repository needs. Concrete
 * repositories extend this and add only their entity-specific finders, so the
 * `getRepo(manager)` fallback logic lives in exactly one place.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  /**
   * Resolve the repository to use: when a transaction's EntityManager is passed,
   * operate within that transaction; otherwise use the injected repository.
   */
  protected getRepo(manager?: EntityManager): Repository<T> {
    return manager?.getRepository<T>(this.repository.target) ?? this.repository;
  }

  create(input: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(input));
  }

  findAll(manager?: EntityManager): Promise<T[]> {
    return this.getRepo(manager).find();
  }

  findById(id: string, manager?: EntityManager): Promise<T | null> {
    // T is generic here, so TS can't see that every entity has a string `id`;
    // the double assertion narrows the literal to the repository's where-clause
    // type. Concrete repositories that need relations override this.
    return this.getRepo(manager).findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }
}
