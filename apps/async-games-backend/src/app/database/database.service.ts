import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    handler: (context: { queryRunner: QueryRunner; manager: EntityManager }) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await handler({
        queryRunner,
        manager: queryRunner.manager,
      });
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as Error;
      this.logger.error('Transaction failed, rolling back', err.stack);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkConnection(): Promise<boolean> {
    const runner = this.dataSource.createQueryRunner();
    try {
      await runner.connect();
      await runner.query('SELECT 1');
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Database connectivity check failed', err.stack);
      return false;
    } finally {
      // Always return the runner to the pool — including on the failure path,
      // which is exactly when this check runs. Leaking here exhausts the pool.
      await runner.release();
    }
  }
}
