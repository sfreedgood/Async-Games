# Async-Games  
Persistent turn-based tabletop gaming across timezones.

Strategy-heavy tabletop games typically require synchronous presence. For distributed friend groups across timezones and busy schedules, this creates coordination friction and reduces play frequency.

Async-Games explores a turn-based model designed for asynchronous play — allowing games to continue cleanly across hours or days without requiring shared time.

[TOC]

---

## Status

Prototype.

The current implementation focuses on establishing the core game model and infrastructure. This includes:

- Base game state (card and deck entities and core functionalities such as shuffle, draw, etc., turn progression logic)
- A minimal “table” UI for rendering and interacting with state
- One or two core API endpoints used to create and render game elements
- Functional development environment
- Minimal CI/CD setup and functional test coverage

Interactions are still limited and primarily exercised manually in development. The emphasis at this stage is validating clarity of state, turn ownership mechanics, and foundational system structure before expanding feature scope.

The product direction is defined; the implementation will evolve deliberately.

---

## Current Scope (MVP Foundation)

- Single-game support: **Hearts**
- Server-enforced turn ownership
- Persistent, authoritative game state
- Deterministic move validation

Hearts was chosen intentionally:
- Strictly turn-based (no interrupt stack complexity)
- Well-defined rules
- Suitable for validating asynchronous interaction patterns before introducing higher-complexity systems (e.g., MTG stack mechanics)

---

## Future Exploration (Post-MVP)

- Support for complex rule systems (e.g., Magic: The Gathering)
- Player communication & notification loops
- Multi-game extensibility architecture
- Structured telemetry for gameplay pacing and retention analysis

Future additions will be evaluated based on their impact on clarity, pacing, and long-running engagement.

---

## What This Project Is Not

- Not a real-time tabletop simulator
- Not intended to replace tools like Tabletop Simulator
- Not a competitive ladder platform
- Not focused on esports-style rapid gameplay

The primary design constraint is asynchronous continuity, not synchronous fidelity.

---

## Documentation

### Product

- [Vision](docs/product/vision.md)
- [Roadmap](docs/product/roadmap.md)
- [Competitive Analysis](docs/product/competitive-analysis.md)

### Architecture

- [System Overview](docs/architecture/ARCHITECTURE.md)
- (Additional technical decision documents to follow)

---

## Getting Started

See [Getting Started Guide](docs/architecture/getting-started.md) for:
- Local environment setup

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development workflow
- Contribution guidelines

---

## Project Intent

Async-Games began as a personal solution to a real problem and has evolved into a deliberate space for practicing product thinking and system design under real constraints. See the [Vision](docs/product/vision.md) for more context.

---

## License

Async-Games is distributed under the GNU Affero General Public License, version 3 (or any later version). This ensures that anyone who modifies and runs the software for others over a network must share their changes, protecting the open-source community while allowing technical users to self-host.  
See [LICENSE](LICENSE) for full terms.  

For commercial or dual-licensing discussions, please reach out via the repository issues or contact information listed in project docs.
