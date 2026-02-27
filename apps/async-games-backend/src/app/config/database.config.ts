import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  ssl: boolean;
  synchronize: boolean;
}

function toBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export default registerAs('database', (): DatabaseConfig => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'async_games',
  password: process.env.DB_PASSWORD ?? 'async_games',
  database: process.env.DB_NAME ?? 'async_games',
  logging: toBoolean(process.env.DB_LOGGING, false),
  ssl: toBoolean(process.env.DB_SSL, false),
  synchronize: toBoolean(process.env.DB_SYNCHRONIZE, false),
}));
