# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Async-Games is a prototype for persistent, turn-based tabletop gaming across timezones. The backend is the **authoritative source of truth** for all game state; the frontend renders state and never enforces game rules independently. Every game-state mutation is validated server-side before being persisted or returned. The current MVP target is **Hearts**.

## Monorepo layout

Nx workspace (npm, `workspaces: apps/*`) with four projects under `apps/`:

- `async-games-backend` — NestJS API (port 3000)
- `async-games-frontend` — React 19 + Vite client (port 4200)
- `async-games-backend-e2e` — Playwright API tests
- `async-games-frontend-e2e` — Playwright UI tests

There is no persistence layer or auth yet — state is rebuilt per request (see TODOs in the classic-card controller/service).

## Commands

All tasks run through Nx. Prefix with `npx ` if Nx is not installed globally.

```bash
npm install                              # install (CI uses npm ci --legacy-peer-deps)

nx serve async-games-backend             # API at http://localhost:3000/api, Swagger UI at /swagger
nx serve async-games-frontend            # client at http://localhost:4200
nx storybook async-games-frontend        # Storybook at http://localhost:6006

nx test async-games-backend              # Jest unit/domain tests for one project
nx test async-games-backend --testFile=classic-card.validator.spec.ts   # single test file
nx e2e async-games-backend-e2e           # Playwright API e2e
nx e2e async-games-frontend-e2e          # Playwright UI e2e

nx lint async-games-frontend             # ESLint for one project
nx run-many -t lint test build e2e       # what CI runs across all projects
nx graph                                 # project dependency graph
nx reset                                 # clear Nx cache if it reports stale data
```

CI (`.github/workflows/ci.yml`) runs `nx run-many -t lint test build e2e` on PRs and pushes to `main`, with Nx Cloud caching. Match it locally before pushing.

## Architecture conventions

**Domain organization (mirrored across backend and frontend).** Each game concept lives in a `domains/<domain>/` folder. The same domain name appears on both sides so they line up (e.g. `classic-card`, `player`, `table`). Add new game features as a new domain folder rather than spreading logic across layers.

**Backend layering** (`apps/async-games-backend/src/`):
- `abstract/` — generic, game-agnostic base classes (`Card`, `Deck`, `Hand`, `Player`, `Turn`, `GameTracker`). Concrete games extend these. `Turn`/`GameTracker` model turn ownership and clockwise play progression — the core of the async turn model.
- `app/domains/<domain>/` — per-domain NestJS slice. Files use short names: `module.ts`, `controller.ts`, `service.ts`, plus `*.entity.ts`, `*.dto.ts`, `*.interface.ts`, `*.validator.ts`. Each domain re-exports through `index.ts` and is wired into `app/app.module.ts`.
- `utils/` — shared helpers including `error.utils.ts` (`EntityValidationError`, `ValidationErrorMessage`).

**Two-layer validation** is the standard backend pattern:
1. DTOs with `class-validator` decorators validate request shape at the controller boundary (→ 400).
2. Custom entity validators (e.g. `classic-card.validator.ts`) enforce business/domain rules and throw `EntityValidationError` (→ 422).

Controllers stay thin and delegate to services; services own game rules and construct domain entities.

**Frontend** (`apps/async-games-frontend/src/`):
- `domains/<domain>/` holds `components/` (with co-located `*.stories.tsx`) and `entities/` (client-side mirrors of domain models).
- `api/` is a typed Axios layer: `buildUrl`/`getData` with generic `Response<T>` typing; base path is `http://localhost:3000/api`.
- `app/hooks/api.ts` provides data-fetching hooks; state is local component state + hooks (no Redux/global store).
- `shared/` holds cross-domain components and entities. Styling is Tailwind.

**Build tooling differs per app:** backend builds with Webpack, frontend with Vite — both orchestrated by Nx. TypeScript is strict (`tsconfig.base.json`: `strict`, `noUnusedLocals`, `noImplicitOverride`, `noImplicitReturns`).

## Testing conventions

- Unit tests are co-located as `*.spec.ts(x)` next to the file under test and run by Jest.
- The `.spec` vs `.test` suffix is load-bearing: Jest only collects `*.spec.ts(x)` (see `jest.preset.js`), while `*.test.ts(x)` is reserved for Vitest component/snapshot tests and Playwright e2e. A unit test named `*.test.ts(x)` is silently skipped by Jest — always use `.spec` for Jest unit tests.
- Integration/e2e tests live in the dedicated `*-e2e` projects and run by Playwright.
- Tests must be deterministic — no reliance on external services or timing.

## Contribution workflow

GitHub flow: branch from `main` (`feature/*`, `fix/*`, `chore/*`, `hotfix/*`), open PRs into `main`, squash-and-merge. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`). Licensed AGPL-3.0-or-later. See `CONTRIBUTING.md` and `docs/architecture/` for fuller detail.
