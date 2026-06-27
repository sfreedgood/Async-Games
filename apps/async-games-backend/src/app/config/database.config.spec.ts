import databaseConfig from './database.config';

const REQUIRED = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'user',
  DB_PASSWORD: 'pass',
  DB_NAME: 'db',
};

describe('databaseConfig', () => {
  const original = process.env;

  beforeEach(() => {
    // Start each case from a clean slate of DB_* vars.
    process.env = { ...original };
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('DB_')) delete process.env[key];
    }
  });

  afterAll(() => {
    process.env = original;
  });

  const setEnv = (overrides: Record<string, string | undefined> = {}) => {
    Object.assign(process.env, REQUIRED, overrides);
  };

  it('parses a valid configuration', () => {
    setEnv();
    const config = databaseConfig();
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.username).toBe('user');
    expect(config.database).toBe('db');
  });

  it('throws when a required variable is missing', () => {
    setEnv({ DB_NAME: undefined });
    expect(() => databaseConfig()).toThrow(/Missing required database/);
  });

  it.each(['abc', '0', '-1', '70000', '5432.5'])(
    'throws on invalid DB_PORT %p',
    (port) => {
      setEnv({ DB_PORT: port });
      expect(() => databaseConfig()).toThrow(/Invalid DB_PORT/);
    }
  );

  it('verifies the TLS certificate by default when SSL is enabled', () => {
    setEnv({ DB_SSL: 'true' });
    expect(databaseConfig().sslRejectUnauthorized).toBe(true);
  });

  it('allows opting out of TLS verification explicitly', () => {
    setEnv({ DB_SSL: 'true', DB_SSL_REJECT_UNAUTHORIZED: 'false' });
    expect(databaseConfig().sslRejectUnauthorized).toBe(false);
  });

  it('defaults synchronize off', () => {
    setEnv();
    expect(databaseConfig().synchronize).toBe(false);
  });
});
