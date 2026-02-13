# Product Roadmap

The roadmap is structured around validating the asynchronous interaction model before expanding complexity or feature scope.

The primary goal is not rapid feature growth, but confidence in pacing, clarity, and persistence.

---

## Phase 1 — Core Asynchronous Foundation (Current Focus)

Objective: Prove that structured asynchronous turn progression works reliably and clearly.

Scope:
- Single game: Hearts
- Server-enforced turn ownership
- Persistent, authoritative game state
- Deterministic move validation
- Clear move history
- Basic game recovery (resume after disconnect)
- Ability to reference past game states

Success Criteria:
- Games can span multiple days without confusion
- No ambiguity about turn ownership
- Returning players can immediately understand state
- High game completion rate in small friend groups
- Users can review game history

Risks Being Tested:
- State clarity degradation over time
- Player drop-off due to slow pacing
- Confusion around turn transitions
- Inability to interact with previous game states

---

## Phase 2 — Pacing & Engagement Systems

Objective: Strengthen asynchronous continuity without over-enforcing participation.

Scope:
- Structured notification system
- Optional reminder cadence
- Configurable turn time windows
- Activity indicators (last move timestamps)
- Clear game state summaries for returning players

Key Questions:
- How much structure improves completion without feeling restrictive?
- Do reminders increase engagement or create fatigue?
- What is the optimal balance between flexibility and accountability?

Success Criteria:
- Increased game completion rate
- Reduced abandoned games
- Positive player feedback on pacing

---

## Phase 3 — Complexity Stress Test

Objective: Validate that interrupt-driven, state-reactive systems can remain clear and intuitive in an asynchronous environment.

Candidate:
- Magic: The Gathering (limited format or constrained rule subset)

Focus Areas:
- Handling interrupt mechanics
- Representing stack resolution clearly
- Maintaining clarity across asynchronous responses
- Preventing state ambiguity in reactive turns

Risks:
- Cognitive overload when returning mid-stack
- Increased edge-case handling complexity
- Notification fatigue from reactive mechanics

Expansion into complex systems will only occur if Phases 1–2 demonstrate stability.

---

## Phase 4 — Extensibility & Multi-Game Architecture

Objective: Support additional strategic systems without rewriting core pacing logic.

Scope:
- Game engine abstraction layer
- Rule module isolation
- Shared turn and state framework
- Documentation for community-driven game modules

Success Criteria:
- New game systems can be added without modifying core async infrastructure
- Contributors can extend the platform cleanly

---

## Long-Term Considerations

- Friend-group history and continuity
- Lightweight social features
- Game analytics (completion rate, pacing distribution)
- Governance model for open-source expansion

Feature expansion will remain secondary to clarity, pacing integrity, and persistence.
