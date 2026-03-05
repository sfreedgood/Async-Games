# Copilot instructions for Async-Games

## Big picture architecture
- Nx monorepo with four apps: NestJS backend, React/Vite frontend, and two Playwright E2E apps (see [nx.json](nx.json) and [apps](apps)).
- Backend is authoritative for game state; frontend renders and calls REST endpoints under the global prefix `/api` (see [apps/async-games-backend/src/main.ts](apps/async-games-backend/src/main.ts)).
- Swagger is hosted at `/swagger` (see [apps/async-games-backend/src/main.ts](apps/async-games-backend/src/main.ts)).
- Domain logic lives in backend “domains” modules; each domain typically has module/controller/service/DTO/entity/validator files (example: [apps/async-games-backend/src/app/domains/classic-card](apps/async-games-backend/src/app/domains/classic-card)).
- Shared game primitives (Deck/Turn/GameTracker) live under backend abstract models (see [apps/async-games-backend/src/abstract](apps/async-games-backend/src/abstract)).

## Backend conventions & integration points
- Config is loaded globally from `.env.development` (local dev) or `.env` (production/CI) via ConfigModule based on `NODE_ENV` (see [apps/async-games-backend/src/app/app.module.ts](apps/async-games-backend/src/app/app.module.ts)).
- Database uses TypeORM with PostgreSQL; repositories are exported from DatabaseModule (see [apps/async-games-backend/src/app/database/database.module.ts](apps/async-games-backend/src/app/database/database.module.ts)).
- Use `DatabaseService.runInTransaction()` for multi-step writes (see [apps/async-games-backend/src/app/database/database.service.ts](apps/async-games-backend/src/app/database/database.service.ts)).
- DTOs use class-validator + Swagger decorators (example: [apps/async-games-backend/src/app/domains/classic-card/classic-card.dto.ts](apps/async-games-backend/src/app/domains/classic-card/classic-card.dto.ts)).

## Frontend conventions & data flow
- API calls are centralized in [apps/async-games-frontend/src/api](apps/async-games-frontend/src/api); `buildUrl()` builds `/api` URLs and is used by hooks.
- The default base URL is `http://localhost:3000/api` (see [apps/async-games-frontend/src/api/index.ts](apps/async-games-frontend/src/api/index.ts)).
- Data fetching uses `useAxiosGet` with local component state (see [apps/async-games-frontend/src/app/hooks/api.ts](apps/async-games-frontend/src/app/hooks/api.ts)).

## Developer workflows (Nx)
- Install: `npm install` (repo root).
- Local DB: `docker compose -f docker-compose.db.yml up -d` and seed via `apps/async-games-backend/scripts/seed-db.sh` (see [docs/architecture/getting-started.md](docs/architecture/getting-started.md)).
- Serve apps: `npx nx serve async-games-backend` and `npx nx serve async-games-frontend` (see [docs/architecture/getting-started.md](docs/architecture/getting-started.md)).
- Storybook: `npx nx storybook async-games-frontend` (see [docs/architecture/getting-started.md](docs/architecture/getting-started.md)).
- Tests: `npx nx test async-games-backend`, `npx nx e2e async-games-frontend-e2e`, `npx nx e2e async-games-backend-e2e` (see [docs/architecture/getting-started.md](docs/architecture/getting-started.md)).
- Tooling helpers: `npx nx graph`, `npx nx lint <project>`, `npx nx reset` (see [docs/architecture/getting-started.md](docs/architecture/getting-started.md)).

## Examples of local patterns
- Controllers delegate to services and return domain entities directly (example: [apps/async-games-backend/src/app/domains/classic-card/controller.ts](apps/async-games-backend/src/app/domains/classic-card/controller.ts)).
- Classic-card service performs validation via `validateCard` and returns entities (see [apps/async-games-backend/src/app/domains/classic-card/service.ts](apps/async-games-backend/src/app/domains/classic-card/service.ts)).
- Frontend renders backend state directly (example: [apps/async-games-frontend/src/app/app.tsx](apps/async-games-frontend/src/app/app.tsx)).
