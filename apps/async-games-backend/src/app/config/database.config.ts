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
}

function toBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
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

    return {
      host,
      port: Number(port),
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
    };
  },
);
