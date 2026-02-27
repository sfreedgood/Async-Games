import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

const makeQueryRunner = (overrides: Record<string, unknown> = {}) => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockResolvedValue(undefined),
  manager: {},
  ...overrides,
});

const makeDataSource = (queryRunner: ReturnType<typeof makeQueryRunner>) =>
  ({
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  }) as unknown as DataSource;

describe('DatabaseService', () => {
  let service: DatabaseService;
  let queryRunner: ReturnType<typeof makeQueryRunner>;

  beforeEach(async () => {
    queryRunner = makeQueryRunner();
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: DataSource, useValue: makeDataSource(queryRunner) },
      ],
    }).compile();
    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('runInTransaction', () => {
    it('connects, starts, commits, and releases on success', async () => {
      const handler = jest.fn().mockResolvedValue('result');

      const result = await service.runInTransaction(handler);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledWith({
        queryRunner,
        manager: queryRunner.manager,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('rolls back, releases, and rethrows on handler error', async () => {
      const error = new Error('handler error');
      const handler = jest.fn().mockRejectedValue(error);

      await expect(service.runInTransaction(handler)).rejects.toThrow('handler error');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('checkConnection', () => {
    it('returns true when the query succeeds', async () => {
      const result = await service.checkConnection();
      expect(result).toBe(true);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.query).toHaveBeenCalledWith('SELECT 1');
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('returns false when the query throws', async () => {
      queryRunner.connect.mockRejectedValue(new Error('connection refused'));

      const result = await service.checkConnection();
      expect(result).toBe(false);
    });
  });
});
