#!/bin/bash

# Database configuration from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME}"

# Validate required environment variables
if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
  echo -e "${ORANGE}Error: Missing required environment variables${NC}"
  echo "Please ensure the following variables are set in .env.development:"
  echo "  DB_USERNAME"
  echo "  DB_PASSWORD"
  echo "  DB_NAME"
  exit 1
fi

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;38;5;214m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🌱 Seeding database: $DB_NAME${NC}"
echo -e "   Host: $DB_HOST, Port: $DB_PORT, User: $DB_USERNAME"

# Container management. The Postgres container is named `async_games` in
# docker-compose.yml (container_name), which is independent of DB_NAME. Default
# to that stable name and allow an override via DB_CONTAINER_NAME rather than
# assuming the container is named after the database.
CONTAINER_NAME="${DB_CONTAINER_NAME:-async_games}"

# Start Docker container if available
if command -v docker >/dev/null 2>&1; then
  # Check if container exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Container exists, check if it's running
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
      echo -e "${YELLOW}Starting existing container: $CONTAINER_NAME${NC}"
      docker start "$CONTAINER_NAME" >/dev/null
    fi
  else
    # Container doesn't exist, user needs to create it
    echo -e "${YELLOW}Docker container: $CONTAINER_NAME does not exist, please run the following then try again:${NC}"
    echo -e "  docker compose -f docker-compose.db.yml up -d --build"
    echo -e "  # or set DB_ENV_FILE=.env for the production profile"
    exit 1
  fi
  
  # Wait for database to be ready
  echo -e "${YELLOW}Waiting for database to be ready...${NC}"
  for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1; then
      echo -e "${GREEN}✓ Database is ready${NC}"
      break
    fi
    if [ $i -eq 30 ]; then
      echo -e "${ORANGE}✗ Database did not become ready in time${NC}"
      exit 1
    fi
    sleep 1
  done
else
  echo -e "${YELLOW}Docker not found. Using local psql connection.${NC}"
fi

# Ensure psql is available
if ! command -v psql >/dev/null 2>&1; then
  echo -e "${YELLOW}psql not found. Install the PostgreSQL client (libpq/psql) for your OS:${NC}"

  OS_NAME="$(uname -s)"
  case "$OS_NAME" in
    Darwin)
      echo "macOS (Homebrew):"
      echo "  brew install libpq"
      echo "  brew link --force libpq"
      ;;
    Linux)
      echo -e "${YELLOW}⚠️ Note: the install commands below are suggestions and have NOT been tested on your system. Verify and adjust for your Linux distribution.${NC}"
      echo "Linux (Debian/Ubuntu):"
      echo "  sudo apt-get update && sudo apt-get install -y postgresql-client"
      echo "Linux (RHEL/Fedora):"
      echo "  sudo dnf install -y postgresql"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      echo -e "${YELLOW}⚠️ Note: the install commands below are suggestions and have NOT been tested on your system. Verify and adjust for your Windows distribution.${NC}"
      echo "Windows (Chocolatey):"
      echo "  choco install libpq"
      echo "Windows (Scoop):"
      echo "  scoop install libpq"
      ;;
    *)
      echo "Unknown OS. Please install the PostgreSQL client (psql) manually."
      ;;
  esac
  exit 1
fi

# Override psql to run inside the container (supports heredocs and -c)
if command -v docker >/dev/null 2>&1; then
  # Check if our container is running
  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Using Docker container: $CONTAINER_NAME${NC}"
    # Wrapper only routes psql through `docker exec`; the call sites already pass
    # -h/-p/-U/-d, so don't duplicate the connection flags here.
    psql() {
      docker exec -i "$CONTAINER_NAME" env PGPASSWORD="$DB_PASSWORD" psql "$@"
    }
  else
    echo -e "${YELLOW}Docker container not running. Using local psql with TCP.${NC}"
  fi
else
  echo -e "${YELLOW}Docker not found. Using local psql with TCP.${NC}"
fi

# The TypeORM entities (src/app/database/entities) are the single source of
# truth for the schema; DB_SYNCHRONIZE (or, later, migrations) creates the
# tables when the backend boots. This script only SEEDS data, so instead of
# re-declaring CREATE TABLE DDL here (which drifts from the entities), it just
# verifies the expected tables already exist and tells the user how to create
# them if they don't.
verify_schema() {
  echo -e "${YELLOW}Verifying database schema...${NC}"

  local missing=0
  for table in users active_games hearts; do
    local exists
    exists=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
      -t -A -c "SELECT to_regclass('public.${table}');" 2>&1)
    if [ $? -ne 0 ]; then
      echo -e "${ORANGE}✗ Failed to check '${table}' table: ${exists}${NC}"
      return 1
    fi
    if [ -z "$exists" ] || [ "$exists" = "null" ]; then
      echo -e "${ORANGE}✗ Table '${table}' does not exist${NC}"
      missing=1
    else
      echo -e "${GREEN}✓ Table '${table}' found${NC}"
    fi
  done

  if [ "$missing" -ne 0 ]; then
    echo -e "${ORANGE}Schema is missing tables. Create it first by starting the"
    echo -e "backend with DB_SYNCHRONIZE=true (nx serve async-games-backend) or"
    echo -e "by running the TypeORM migrations, then re-run this seed script.${NC}"
    return 1
  fi
}

seed_users() {
  # Check if users table is empty
  USER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -A -c "SELECT COUNT(*) FROM users;" 2>&1)
  local psql_exit=$?

  if [ $psql_exit -ne 0 ]; then
    echo -e "${ORANGE}✗ Failed to query users table: $USER_COUNT${NC}"
    return 1
  fi

  USER_COUNT=${USER_COUNT:-0}

  if [ "$USER_COUNT" -eq 0 ]; then
    echo "Inserting dummy user..."
    # Quoted heredoc ('EOF') so the bcrypt hash's '$' segments are passed
    # through verbatim rather than expanded by the shell.
    # password_hash below is bcrypt('password', 12) — matches hashPassword() in
    # the User service, so the demo login stays valid after the bcrypt switch.
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" << 'EOF'
INSERT INTO users (
  id, username, email, password_hash, full_name, email_verified,
  locale, language, timezone, disabled, meta, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo',
  'demo@example.com',
  '$2b$12$O6LWX5PClKFTFGBTskI1w.kqTa7YqtStiAaiKoTlxfj/Rw.miNqlu',
  'Demo User',
  false,
  'en-US',
  'en',
  'UTC',
  false,
  '{}',
  NOW(),
  NOW()
);
EOF
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ User inserted${NC}"
    else
      echo -e "${ORANGE}✗ Failed to insert user${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}✓ Users table already has data (count: $USER_COUNT)${NC}"
  fi
}

seed_active_games() {
  # Check if active_games table is empty
  local GAME_COUNT
  GAME_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM active_games;" 2>&1)
  local psql_exit=$?

  if [ $psql_exit -ne 0 ]; then
    echo -e "${ORANGE}✗ Failed to query active_games table: $GAME_COUNT${NC}"
    return 1
  fi

  GAME_COUNT=${GAME_COUNT:-0}

  if [ "$GAME_COUNT" -eq 0 ]; then
    echo "Inserting dummy active game..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" << EOF
INSERT INTO active_games (id, name, type, created_at, updated_at) VALUES (
  '650e8400-e29b-41d4-a716-446655440000',
  'Demo Hearts Game',
  'hearts',
  NOW(),
  NOW()
);
EOF
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Active game inserted${NC}"
    else
      echo -e "${ORANGE}✗ Failed to insert active game${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}✓ Active games table already has data (count: $GAME_COUNT)${NC}"
  fi
}

seed_hearts() {
  local HEART_COUNT
  HEART_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -t -A -c "SELECT COUNT(*) FROM hearts;" 2>&1)
  local psql_exit=$?

  if [ $psql_exit -ne 0 ]; then
    echo -e "${ORANGE}✗ Failed to query hearts table: $HEART_COUNT${NC}"
    return 1
  fi

  HEART_COUNT=${HEART_COUNT:-0}

  if [ "$HEART_COUNT" -eq 0 ]; then
    echo "Inserting dummy hearts record..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" << EOF
INSERT INTO hearts (
  id, game_id, player, hand_number, player_hand, trick, initiative, 
  card_suit, card_name, points_taken, created_at, updated_at
) VALUES (
  '750e8400-e29b-41d4-a716-446655440000',
  '650e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  '[]'::jsonb,
  0,
  false,
  'heart',
  '2',
  0,
  NOW(),
  NOW()
);
EOF
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Hearts record inserted${NC}"
    else
      echo -e "${ORANGE}✗ Failed to insert hearts record${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}✓ Hearts table already has data (count: $HEART_COUNT)${NC}"
  fi
}

# Connect to async_gaming db running in Docker Desktop
echo ""
verify_schema || { echo -e "${ORANGE}Schema verification aborted${NC}"; exit 1; }
echo ""
seed_users || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }
seed_active_games || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }
seed_hearts || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }

echo -e "${GREEN}🎉 Database seeding complete!${NC}"
