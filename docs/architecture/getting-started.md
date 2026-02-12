# Getting Started

This guide explains how to install dependencies, run each app, and exercise the main developer workflows in the Async-Games Nx workspace. Refer to `docs/architecture/ARCHITECTURE.md` for the broader system design and technology rationale.

## Prerequisites

- Node.js (LTS recommended)
- npm
- Nx CLI (optional global install)

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

## Run the Applications

### Backend API

```bash
npx nx serve async-games-backend
# OR if you have Nx globally installed:
nx run async-games-backend:serve
```

The NestJS server listens on http://localhost:3000 and hosts the Swagger UI for API exploration.
Swagger UI: http://localhost:3000/api

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
npx nx test async-games-[backend]
# OR if you have Nx globally installed:
nx run async-games-[backend]:test
```

Unit tests cover domain services, validation logic, and supporting utilities. Replace the project name to run other suites.

### End-to-End Tests (Playwright)
**Not yet implemented** 
Will cover critical user journeys and API interactions and prevent regressions.
Once implemented, you can run E2E tests with:**

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
