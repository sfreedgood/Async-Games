# Getting Started

This guide explains how to install dependencies, run each app, and exercise the main developer workflows in the Async-Games Nx workspace. Refer to `docs/architecture/ARCHITECTURE.md` for the broader system design and technology rationale.

## Prerequisites

- Node.js (LTS recommended)
- npm
- Nx CLI (optional global install)
- Docker Desktop (for local PostgreSQL instance)

To install Nx globally:

```bash
brew install nx
```

Alternatively, run Nx commands through `npx` without a global install:

```bash
npx nx <command>
```

## Install Dependencies

From the repository root:

```bash
npm install
```

## Database & Backend Initialization
**Docker is required for the local PostgreSQL instance. Ensure [Docker Desktop](#docker-desktop) is installed and running before proceeding.**

1. Create a `.env.development` file in the repo root (if it doesn't exist yet) and define the `DB_*` variables required by the Nest backend and Docker Compose. Example:
   ```bash
   cat <<'EOF' > .env.development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=async_games_dev
   DB_PASSWORD=change_me
   DB_NAME=async_games
   DB_LOGGING=false
   DB_SSL=false
   DB_SYNCHRONIZE=true
   EOF
   ```
   Replace the values as needed for your setup.

2. **Development Workflow (Recommended):** Start only the PostgreSQL database in Docker and run the backend separately with live-reload:
   ```bash
   docker compose --env-file .env.development up postgres --build
   ```
   Then run the backend in another terminal:
   ```bash
   npx nx serve async-games-backend
   # OR if you have Nx globally installed:
   nx run async-games-backend:serve
   ```
   This allows hot-module reloading and faster iteration during development.

3. **Full Docker Stack (CI/Production):** To build and start both the PostgreSQL database and NestJS backend via Docker:
   ```bash
   docker compose --env-file .env up -d --build
   # or in development (attached / foreground session):
   docker compose --env-file .env.development up --build
   ```
   Or use the provided helper script (useful for CI pipelines):
   ```bash
   bash scripts/docker-stack-build-start.sh .env
   # or for development:
   bash scripts/docker-stack-build-start.sh .env.development
   ```
   By default, the helper script runs:
   - `.env.development` in attached mode (foreground)
   - `.env` in detached mode (background)
  
   You can override the mode explicitly:
   ```bash
   bash scripts/docker-stack-build-start.sh .env.development detached
   bash scripts/docker-stack-build-start.sh .env attached
   ```

   The helper script will:
   - Build the backend distributable via Nx
   - Start both services with Docker Compose
   - Wait for the backend to become healthy (detached mode)
   - Display Swagger endpoint when ready

4. To seed the database with dummy data, run:
   ```bash
   bash apps/async-games-backend/scripts/seed-db.sh
   ```
   or see [SEEDING.md](apps/async-games-backend/SEEDING.md) for more details.

Suggestion: If you want a GUI to work with the DB, I use [pgAdmin](https://www.pgadmin.org/)

## CI/CD Pipeline

For automated CI environments (GitHub Actions, GitLab CI, etc.), use the provided helper script:

```bash
bash scripts/docker-stack-build-start.sh .env
```

Alternatively, see [`.github/workflows/ci-docker-stack.yml`](.github/workflows/ci-docker-stack.yml) for a complete GitHub Actions workflow example that:
- Builds backend artifacts
- Runs unit and lint tests
- Builds Docker images
- Runs E2E tests

The workflow demonstrates the full build → test → containerize → test cycle for reproducible CI deployments.

## Run the Applications

### Backend API

```bash
npx nx serve async-games-backend
# OR if you have Nx globally installed:
nx run async-games-backend:serve
```

The NestJS server listens on http://localhost:3000 and hosts the Swagger UI for API exploration.
Swagger UI: http://localhost:3000/api

> `nx serve async-games-backend` automatically loads `.env.development`. Switch to production settings with `nx run async-games-backend:serve:production`, which pulls variables from `.env`.

### Frontend Client

```bash
npx nx serve async-games-frontend
# OR if you have Nx globally installed:
nx run async-games-frontend:serve
```

Vite serves the React client on http://localhost:4200 and proxies API calls to the backend.

## UI Component Development with Storybook

The project uses Storybook for UI component development and documentation. To start Storybook:

```bash
npx nx storybook async-games-frontend
# OR if you have Nx globally installed:
nx run async-games-frontend:storybook
```

This will start Storybook on http://localhost:6006, where you can view and interact with UI components in isolation.
This supports development of UI components without needing to run the full application. Encouraging clear separation of rendering logic from application state and allows for focused testing of UI elements.

## Testing Workflows

### Unit & Domain Tests (Jest)

```bash
npx nx test async-games-backend
# OR if you have Nx globally installed:
nx run async-games-backend:test
```

Unit tests cover domain services, validation logic, and supporting utilities. Replace the project name to run other suites.

### End-to-End Tests (Playwright)

Playwright-based E2E tests are available and cover critical user journeys and API interactions, helping to prevent regressions.

You can run E2E tests with:

- Backend API flows:

  ```bash
  npx nx e2e async-games-backend-e2e
  ```

- Frontend journeys:

  ```bash
  npx nx e2e async-games-frontend-e2e
  ```

These targets exercise asynchronous flows and validate that HTTP contracts between layers remain stable.

## Helpful Nx Commands

**Visualize the project graph and dependency boundaries:**
```bash
npx nx graph
# OR if you have Nx globally installed:
nx graph
```

**Run linting (per project) to catch style issues early:**
```bash
npx nx lint async-games-frontend
# OR if you have Nx globally installed:
nx run async-games-frontend:lint
```

**Clear caches if Nx reports stale data:**
```bash
npx nx reset
# OR if you have Nx globally installed:
nx reset
```

With these workflows you can spin up the stack end-to-end, iterate on components, and validate critical tests quickly.

## Installing Prerequisites
- Node.js (LTS recommended)
- npm
- Nx CLI (optional global install)

### Docker Desktop
1. Download and install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Follow the installation instructions for your operating system.
3. Once installed, ensure Docker is running before proceeding with the database setup.
