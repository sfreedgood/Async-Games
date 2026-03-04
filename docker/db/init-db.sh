#!/bin/bash
set -euo pipefail

ENV_FILE="${DB_ENV_PATH:-/docker-entrypoint-initdb.d/.db_env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "No environment file found at $ENV_FILE; skipping application DB bootstrap."
  exit 0
fi

set -a
. "$ENV_FILE"
set +a

: "${DB_NAME:?DB_NAME is required in $ENV_FILE}"
: "${DB_USERNAME:?DB_USERNAME is required in $ENV_FILE}"
: "${DB_PASSWORD:?DB_PASSWORD is required in $ENV_FILE}"

psql --username "$POSTGRES_USER" <<-EOSQL
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USERNAME}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${DB_USERNAME}', '${DB_PASSWORD}');
  END IF;
END
$$;
EOSQL

psql --username "$POSTGRES_USER" <<-EOSQL
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
    EXECUTE format('CREATE DATABASE %I OWNER %I', '${DB_NAME}', '${DB_USERNAME}');
  END IF;
END
$$;
EOSQL

psql --username "$POSTGRES_USER" <<-EOSQL
ALTER ROLE ${DB_USERNAME} SET search_path TO public;
EOSQL

# Grant minimal database-level permissions
psql --username "$POSTGRES_USER" --dbname "${DB_NAME}" <<-EOSQL
GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_USERNAME};
GRANT USAGE ON SCHEMA public TO ${DB_USERNAME};
EOSQL

# Set default privileges for tables, sequences, and functions created by the owner
psql --username "$POSTGRES_USER" --dbname "${DB_NAME}" <<-EOSQL
ALTER DEFAULT PRIVILEGES FOR USER ${DB_USERNAME} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_USERNAME};
ALTER DEFAULT PRIVILEGES FOR USER ${DB_USERNAME} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${DB_USERNAME};
ALTER DEFAULT PRIVILEGES FOR USER ${DB_USERNAME} IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ${DB_USERNAME};
EOSQL

# Grant permissions on existing tables (if any)
psql --username "$POSTGRES_USER" --dbname "${DB_NAME}" <<-EOSQL
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_USERNAME};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${DB_USERNAME};
EOSQL
