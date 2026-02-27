#!/bin/bash

# Database configuration from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-async_games}"
DB_PASSWORD="${DB_PASSWORD:-async_games}"
DB_NAME="${DB_NAME:-async_games}"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;38;5;214m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🌱 Seeding database: $DB_NAME${NC}"
echo -e "   Host: $DB_HOST, Port: $DB_PORT, User: $DB_USERNAME"

# Container management
CONTAINER_NAME=$DB_NAME

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
    echo -e "  docker compose -f docker-compose.db.yml up -d"
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
    psql() {
      docker exec -i "$CONTAINER_NAME" env PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" "$@"
    }
  else
    echo -e "${YELLOW}Docker container not running. Using local psql with TCP.${NC}"
  fi
else
  echo -e "${YELLOW}Docker not found. Using local psql with TCP.${NC}"
fi

init_tables() {
  echo -e "${YELLOW}Initializing database tables...${NC}"
  
  # Create users table
  psql << EOF
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR,
  email_verified BOOLEAN DEFAULT false,
  avatar_url VARCHAR,
  locale VARCHAR NOT NULL,
  language VARCHAR NOT NULL,
  timezone VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disabled BOOLEAN DEFAULT false,
  meta JSONB DEFAULT '{}'::jsonb
);
EOF
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Users table initialized${NC}"
  else
    echo -e "${ORANGE}✗ Failed to create users table${NC}"
    return 1
  fi

  # Create active_games table
  psql << EOF
CREATE TABLE IF NOT EXISTS active_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Active games table initialized${NC}"
  else
    echo -e "${ORANGE}✗ Failed to create active_games table${NC}"
    return 1
  fi

  # Create hearts table
  psql << EOF
CREATE TABLE IF NOT EXISTS hearts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES active_games(id) ON DELETE CASCADE,
  player UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hand_number INTEGER NOT NULL,
  player_hand JSONB DEFAULT '[]'::jsonb,
  trick INTEGER NOT NULL,
  initiative BOOLEAN DEFAULT false,
  card_suit VARCHAR,
  card_name VARCHAR,
  points_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Hearts table initialized${NC}"
  else
    echo -e "${ORANGE}✗ Failed to create hearts table${NC}"
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
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" << EOF
INSERT INTO users (
  id, username, email, password_hash, full_name, email_verified, 
  locale, language, timezone, disabled, meta, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo',
  'demo@example.com',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
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
init_tables || { echo -e "${ORANGE}Table initialization aborted${NC}"; exit 1; }
echo ""
seed_users || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }
seed_active_games || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }
seed_hearts || { echo -e "${ORANGE}Seeding aborted${NC}"; exit 1; }

echo -e "${GREEN}🎉 Database seeding complete!${NC}"