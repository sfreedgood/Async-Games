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

# Values are passed to psql as variables (--set) and referenced with psql's
# safe substitution: :'x' yields a quoted string literal, :"x" a quoted
# identifier. The heredocs are single-quoted ('EOSQL') so the shell performs NO
# expansion — credentials never reach the SQL via shell string interpolation,
# which avoids both quote-breakage (e.g. a password containing a single quote)
# and SQL injection through DB_NAME/DB_USERNAME.

# Create the role and database only if missing. format(%I/%L) handles
# identifier/literal quoting; \gexec runs the generated DDL.
psql --username "$POSTGRES_USER" \
  --set=ON_ERROR_STOP=on \
  --set=db_user="$DB_USERNAME" \
  --set=db_pass="$DB_PASSWORD" \
  --set=db_name="$DB_NAME" <<-'EOSQL'
	SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_pass')
	WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user')
	\gexec

	SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
	WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')
	\gexec

	ALTER ROLE :"db_user" SET search_path TO public;
EOSQL

# Grant minimal database-level permissions, connected to the application DB.
psql --username "$POSTGRES_USER" --dbname "$DB_NAME" \
  --set=ON_ERROR_STOP=on \
  --set=db_user="$DB_USERNAME" \
  --set=db_name="$DB_NAME" <<-'EOSQL'
	GRANT CONNECT ON DATABASE :"db_name" TO :"db_user";
	GRANT USAGE ON SCHEMA public TO :"db_user";

	-- Default privileges for objects the owner creates later.
	ALTER DEFAULT PRIVILEGES FOR USER :"db_user" IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"db_user";
	ALTER DEFAULT PRIVILEGES FOR USER :"db_user" IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO :"db_user";
	ALTER DEFAULT PRIVILEGES FOR USER :"db_user" IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO :"db_user";

	-- Permissions on any already-existing objects.
	GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"db_user";
	GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"db_user";
EOSQL
