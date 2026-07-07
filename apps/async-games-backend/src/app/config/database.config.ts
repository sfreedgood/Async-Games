import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  ssl: boolean;
  /**
   * Whether to verify the server's TLS certificate when ssl is enabled.
   * Defaults to true — disabling it removes MITM protection and should only be
   * done knowingly (e.g. a local proxy). Prefer supplying sslCa instead.
   */
  sslRejectUnauthorized: boolean;
  /** Optional PEM CA certificate (or bundle) used to verify the server cert. */
  sslCa?: string;
  synchronize: boolean;
  /** Allow synchronize to run even when NODE_ENV=production (CI only — unsafe). */
  allowSynchronizeInProduction: boolean;
  /** Connection retry/timeout knobs passed through to TypeORM. */
  retryAttempts: number;
  retryDelay: number;
  connectTimeoutMs: number;
}

function toBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

// Parse a non-negative integer env var, failing fast on a malformed value so a
// NaN never silently reaches the driver (mirrors the DB_PORT validation below).
function toInt(name: string, value: string | undefined, defaultValue: number) {
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name} '${value}': must be a non-negative integer`);
  }
  return parsed;
}

export default registerAs(
  'database',
  (): DatabaseConfig => {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;

    if (!host || !port || !username || !password || !database) {
      throw new Error(
        'Missing required database environment variables: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME'
      );
    }

    // Fail fast on a malformed port rather than letting NaN reach the driver
    // and surface as an opaque connection error at startup.
    const portNumber = Number(port);
    if (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
      throw new Error(
        `Invalid DB_PORT '${port}': must be an integer between 1 and 65535`
      );
    }

    return {
      host,
      port: portNumber,
      username,
      password,
      database,
      logging: toBoolean(process.env.DB_LOGGING, false),
      ssl: toBoolean(process.env.DB_SSL, false),
      // Secure by default: verify the server certificate unless explicitly
      // turned off via DB_SSL_REJECT_UNAUTHORIZED=false.
      sslRejectUnauthorized: toBoolean(
        process.env.DB_SSL_REJECT_UNAUTHORIZED,
        true
      ),
      sslCa: process.env.DB_SSL_CA,
      synchronize: toBoolean(process.env.DB_SYNCHRONIZE, false),
      allowSynchronizeInProduction: toBoolean(
        process.env.DB_ALLOW_SYNCHRONIZE_IN_PRODUCTION,
        false
      ),
      // Fail fast on an unreachable/misconfigured database instead of retrying
      // the default 10 times (~30s) and leaving boot hanging. Raise via env when
      // a slower startup race is expected (e.g. a DB container coming up
      // alongside the app).
      retryAttempts: toInt('DB_RETRY_ATTEMPTS', process.env.DB_RETRY_ATTEMPTS, 5),
      retryDelay: toInt('DB_RETRY_DELAY_MS', process.env.DB_RETRY_DELAY_MS, 2000),
      connectTimeoutMs: toInt(
        'DB_CONNECT_TIMEOUT_MS',
        process.env.DB_CONNECT_TIMEOUT_MS,
        10000
      ),
    };
  },
);
