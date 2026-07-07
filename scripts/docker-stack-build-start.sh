#!/bin/bash
set -euo pipefail

# Docker Stack Build & Start
# This script builds the backend distributable and starts the full Docker Compose stack.
# Usage: ./scripts/docker-stack-build-start.sh [ENV_FILE] [MODE]
# Example: ./scripts/docker-stack-build-start.sh .env.development
#          ./scripts/docker-stack-build-start.sh .env
#          ./scripts/docker-stack-build-start.sh .env detached

ENV_FILE="${1:-.env.development}"
MODE="${2:-auto}"

if [ "$MODE" != "auto" ] && [ "$MODE" != "attached" ] && [ "$MODE" != "detached" ]; then
  echo "Error: MODE must be one of: auto, attached, detached"
  echo "Usage: $0 [ENV_FILE] [MODE]"
  exit 1
fi

if [ "$MODE" = "auto" ]; then
  if [ "$ENV_FILE" = ".env.development" ]; then
    EFFECTIVE_MODE="attached"
  else
    EFFECTIVE_MODE="detached"
  fi
else
  EFFECTIVE_MODE="$MODE"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file '$ENV_FILE' not found."
  echo "Usage: $0 [ENV_FILE] [MODE]"
  exit 1
fi

echo "=== Building backend distributable ==="
npx nx build async-games-backend --configuration=production

# webpack's generatePackageJson emits dist/package.json but no lock file, so the
# committed dist/package-lock.json goes stale whenever backend deps change and the
# Dockerfile's `npm ci` then fails. Regenerate the lock from the freshly generated
# package.json so it always matches.
echo "=== Syncing dist package-lock.json with generated package.json ==="
( cd apps/async-games-backend/dist && npm install --package-lock-only --omit=dev --legacy-peer-deps )

echo ""
echo "=== Starting Docker Compose stack with $ENV_FILE ($EFFECTIVE_MODE mode) ==="

if [ "$EFFECTIVE_MODE" = "attached" ]; then
  echo "Running in attached mode (foreground). Press Ctrl+C to stop."
  docker compose --env-file "$ENV_FILE" up --build
  exit 0
fi

docker compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "=== Docker Compose Stack Status ==="
docker compose --env-file "$ENV_FILE" ps

echo ""
echo "=== Waiting for backend to be ready ==="
max_retries=30
retry_count=0
# Poll the API root, not /swagger: the image runs NODE_ENV=production where
# Swagger is disabled, so /swagger would 404 forever and this loop would never
# succeed even with a healthy backend.
while ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api | grep -q "200"; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -ge $max_retries ]; then
    echo "Error: Backend failed to become healthy after $max_retries attempts."
    echo ""
    echo "=== Backend Logs ==="
    docker compose --env-file "$ENV_FILE" logs nestjs
    exit 1
  fi
  echo "Attempt $retry_count/$max_retries: Backend not ready yet, retrying in 1s..."
  sleep 1
done

echo "✓ Backend is healthy and responding on http://localhost:3000/api"
# Swagger is only served when NODE_ENV!=production; the Docker image runs in
# production, so it is intentionally not exposed here.
echo ""
echo "Stack is ready!"
