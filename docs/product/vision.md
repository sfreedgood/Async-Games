# Vision

## Why This Exists

Many strategy-heavy tabletop games are designed around synchronous presence. Players must sit at the same table — physically or virtually — and participate in real time.

For distributed friend groups across timezones, careers, and changing life schedules, this requirement becomes a barrier. Coordinating a shared block of uninterrupted time becomes increasingly difficult, and game frequency declines.

Async-Games exists to explore a different model:

Persistent, turn-based gameplay that allows players to participate on their own schedule without losing continuity, strategic depth, or social connection.

The goal is not simply to “play games online,” but to reduce coordination friction while preserving the strategic and social qualities that make tabletop games meaningful.

---

## Project Intent

Async-Games began as a personal attempt to solve a practical problem: staying connected to friends through strategy games despite physical distance, timezones, and busy schedules.

Over time, it evolved into a deliberate learning project.

It serves as a space to:

- Practice product thinking through real constraints  
- Hone technical skills, system design, and architectural decision-making
- Examine how gameplay mechanics and technology shape player behavior and social connection

If the project grows into a broader open-source platform or something more, that would be welcome. If it does not, the learning iteself remains the primary outcome.

---

## Core Thesis

Simultaneity is not always necessary for strategic engagement.

Strategy-heavy games already unfold one move at a time. A player makes a decision, the state changes, and the next player responds.

In real life, this already happens asynchronously in small ways. Someone steps away from the table and says, “I’ll be right back.” When they return, they ask, “What did I miss?” The game continues because the state is clear and the rules are enforced.

Async-Games extends that same behavior across hours or days instead of minutes. By saving and validating the game state carefully, players do not need to be present at the same time to participate meaningfully. They only need to understand the current state and take their turn when ready.

This approach aims to:

- Allow meaningful participation without synchronous overlap  
- Preserve strategic integrity  
- Reduce scheduling friction  
- Extend the lifespan of friend-based play groups  

Async-Games prioritizes continuity over simultaneity.

---

## Target Users

Primary audience:

 - Players who care about strategic tabletop or card games
 - Friend groups distributed across locations and timezones
 - People with busy schedules and limited overlapping free time
 
Secondary audience:

- Players who prefer thoughtful, slower-paced gameplay
- Users who want low-pressure strategic engagement without time constraints

This is not intended to compete with fast-paced ladder systems or esports-style platforms.

---

## Design Principles [DRAFT]

### 1. State Must Always Be Clear

At any moment, a returning player should be able to understand the current game state without confusion.

If a player needs live context to understand what happened, the system has failed.

Clarity of state is foundational to asynchronous continuity.

### 2. Turns Must Be Unambiguous

There must never be uncertainty about:
 - Whose turn it is
 - What actions are valid
 - What changes have occurred

Ambiguity erodes trust faster in asynchronous systems than in synchronous ones.

### 3. Pace Should Be Flexible, Not Fragile

The system should tolerate slow participation without collapsing the experience.

 - Delays should not break the game.
 - Silence should not create chaos.
 - The structure must hold even when engagement stretches across days.

### 4. Complexity Must Be Introduced Deliberately

Games with interrupt mechanics or stack-based interactions introduce exponential edge cases in async systems.

Complexity should only be added after the core asynchronous model proves stable and comprehensible.

### 5. Social Context Matters More Than Matchmaking

This platform is built for persistent friend groups, not anonymous competitive churn.

Features should reinforce continuity and shared history rather than rapid, disposable matches.

---

## Why Start With Hearts

Hearts is intentionally selected as the initial implementation because:

- It is strictly turn-based
- It has well-defined and widely understood rules
- It does not involve interrupt mechanics or stack resolution
- It allows validation of asynchronous turn modeling without introducing unnecessary system complexity
- Despite clear turn sequencing, player actions are directly dependent on the current game state, which can change significantly within each trick (turn). This makes it a strong test case for validating the robustness of asynchronous state management and turn ownership mechanics.

Higher-complexity systems (e.g., Magic: The Gathering) will only be considered after validating asynchronous interaction stability.

---

## Long-Term Direction

The long-term direction is to explore how multiple strategy-heavy games might function under a shared asynchronous interaction framework.

This includes:

- Robust game-state modeling
- Notification and pacing systems
- Turn ownership validation
- Structured extensibility for complex, state-dependent rule systems

Success will not be measured by feature volume, but by:

- Game completion rates
- Player retention across asynchronous sessions
- Sustained friend-group engagement
- Reduction in coordination friction

---

## Non-Goals

Async-Games is not intended to:

- Replace physical tabletop experiences
- Replicate real-time simulation tools
- Serve as a competitive ranked ladder platform
- Optimize for rapid match turnover

The project exists to explore a different tradeoff space — one centered around persistence, flexibility, and continuity.
