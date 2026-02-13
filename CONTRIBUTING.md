# Contributing to Async-Games [DRAFT]

**This document is only a draft and subject to change.** It will be finalized once the initial MVP is complete and the project structure is more stable. The goal is to provide clear guidelines for contributors while allowing flexibility as the project evolves.

Thanks for your interest! This document describes standards and workflows for local setup, branching, PRs, testing, and proposing new games.

## Local setup
See [Getting Started Guide](docs/architecture/getting-started.md) for detailed instructions on setting up the development environment, running the backend and frontend locally, and using Storybook for UI component development.

## Environment configuration [Not Implemented Yet]
- Use a .env file for secrets and local overrides; do NOT commit .env or secrets.
- Provide a .env.example with non-sensitive keys and defaults.
- Document required environment variables in README or docs.
- Prefer environment-specific config files and secure storage for CI secrets.

## Branching strategy
- Follow GitHub flow:
  - main (protected, deployable)
  - feature/* — new features and non-breaking improvements
  - fix/* — bug fixes
  - chore/* — maintenance, tooling
  - hotfix/* — urgent fixes against main
- Branch from main; open PRs into main.
- MR's will be "squash and merge" to keep history clean.

## Commit messages & conventions
- Use Conventional Commits: feat:, fix:, docs:, refactor:, chore:, test:.
- Keep messages short with a one-line summary and optional body for context.
- Reference issue numbers (e.g., "fix: validate input (#123)").

## PR standards
- Open PRs against main with a clear title and description.
- Include:
  - What changed and why
  - Screenshots / GIFs if UI-related
  - How to test (step-by-step)
  - Linked issues
- Size: prefer small, reviewable PRs. Break large changes into drafts or multiple PRs.
- Ensure all CI checks pass before requesting review.
- Use reviewers and at least one approved review before merge.
- Use draft PRs for work-in-progress.

## Code conventions
- Follow the project's style guide:
  - JavaScript/TypeScript: ESLint + Prettier config
- Enable pre-commit hooks (husky, pre-commit) to run linters/formatters and simple tests.
- Keep public APIs stable and document breaking changes in changelog.

## Testing expectations
- Unit tests for new logic; integration tests for cross-component behavior.
- Run tests locally before PR; CI should run the full test suite and linters.
- Tests should be deterministic and not rely on external services or timing.
- Unit tests should be added alongside the file they test; integration and end-to-end tests should be organized in the respective `e2e` directory.

## CI/CD
- Use GitHub Actions (or existing CI) to run linting, tests, and builds on PRs.
- Protect main: require passing status checks and at least one approval to merge.
- Automate releases or changelog generation if applicable.

## Issue labeling system
- Use consistent labels, e.g.:
  - type:bug, type:enhancement, type:task
  - priority:high, priority:low
  - status:needs-triage, status:in-progress
  - area:frontend, area:backend, area:docs, area:game
- When opening issues:
  - Provide a descriptive title and steps to reproduce (if bug).
  - Include environment and screenshots when relevant.
  - Add labels or request triage.

## How to propose new games
- Create a new issue using the "game-proposal" template (or follow this outline):
  - Title: game: Short name — brief tagline
  - Description: gameplay summary, intended audience, scope
  - Why: motivation and how it fits Async_Gaming
  - Requirements: assets, third-party services, data models
  - API/interaction sketch: endpoints, event flow, state model
  - Prototype: links to design docs, wireframes, or playable mocks
  - Maintenance: estimated complexity, testing needs, owner
- Triaged proposals may be invited to open RFC PRs.
- RFC process:
  - Add an RFC markdown file in /docs/rfcs/ with goals, non-goals, design, compatibility, migration plan, and open questions.
  - Discuss in PR until consensus; approved RFCs may be implemented in feature branches.

## Misc
- Respect the Code of Conduct.
- Add yourself to AUTHORS if making ongoing, substantial contributions.
- For questions or assistance, open an issue and tag @maintainers.

## License and Contributor Agreement

By submitting a contribution, you agree that your work will be licensed under the GNU Affero General Public License version 3 (or any later version) as described in [LICENSE](LICENSE). This means that your contributions will be freely available under the same license, ensuring that the project remains open-source and that improvements are shared with the community.

If you have questions about commercial or dual-licensing arrangements, please start a discussion before submitting substantial changes.

Thanks for contributing!
