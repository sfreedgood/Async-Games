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

    try {
      // connect()/startTransaction() are inside the try so that a failure here
      // still hits the finally below and releases the runner — leaking it would
      // exhaust the pool exactly when the DB is already struggling.
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await handler({
        queryRunner,
        manager: queryRunner.manager,
      });
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      // Only roll back if a transaction actually started; if connect() or
      // startTransaction() threw, there is nothing to roll back.
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
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
