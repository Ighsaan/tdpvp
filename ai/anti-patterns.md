# Anti-Patterns

This document defines the architectural, implementation, and process anti-patterns that AI agents and developers must avoid in this repository.

The purpose of this file is to reduce common mistakes, preserve architectural integrity, and keep the project maintainable over time.

All AI agents must read this file before making changes.

---

# Core Principle

This project is a **server-authoritative realtime multiplayer game**.

Any change that weakens server authority, increases ambiguity, or makes the simulation less deterministic should be treated as a likely anti-pattern unless explicitly documented and justified.

---

# Architecture Anti-Patterns

## 1. Client Authoritative Gameplay

### Anti-pattern
Allowing the client to decide gameplay outcomes.

Examples:
- client computes damage and sends final result
- client decides whether a tower placement is valid
- client decides whether a unit hit another unit
- client decides base damage
- client controls room phase transitions

### Why this is bad
The client is untrusted and can be manipulated.
This breaks multiplayer fairness and introduces desync risk.

### Required rule
The client may only send **intent**.
The server must validate and determine outcomes.

---

## 2. Shared Contract Duplication

### Anti-pattern
Defining the same command or state schema separately in client and server code.

Examples:
- `PlaceTowerCommand` defined once in the client and again in the server
- duplicated `BattleRoomState` shapes
- duplicated enums for room phase or player side

### Why this is bad
Duplicated contracts drift over time and create subtle bugs.

### Required rule
Shared transport contracts and shared domain schemas belong in the shared package only.

---

## 3. Leaking Server Implementation Into Shared

### Anti-pattern
Putting server-only runtime logic or server-only internal structures into the shared package.

Examples:
- internal simulation caches
- room-only transient indexes
- server service objects
- simulation helper functions that only make sense on the server

### Why this is bad
The shared package should remain stable, explicit, and portable.
Leaking server internals into shared increases coupling.

### Required rule
Only place truly shared contracts and shared domain types in the shared package.

---

## 4. Putting Simulation Logic in the Client

### Anti-pattern
Implementing core gameplay rules on the client as the source of truth.

Examples:
- client-side combat resolution
- client-side movement resolution used as truth
- client-side win condition logic
- client-side spawning schedule used as authoritative

### Why this is bad
This creates desync, cheating risk, and conflicting game state.

### Required rule
The client may visually represent state and perform interpolation, but the server must remain authoritative.

---

## 5. Monolithic Simulation Loop

### Anti-pattern
Putting all simulation logic into one large function.

Examples:
- `updateGameState()`
- `runBattleLoop()`
- `processEverything()`

### Why this is bad
Large simulation functions become fragile, hard to debug, and difficult to extend safely.

### Required rule
Structure the simulation into clear steps such as:
- `processPlayerCommands`
- `processTowerSpawning`
- `processUnitMovement`
- `processUnitCombat`
- `processBaseInteractions`
- `removeDestroyedEntities`
- `checkWinCondition`

---

## 6. Mixing Static Definitions With Runtime State

### Anti-pattern
Using the same object or model for both configuration data and live entities.

Examples:
- a tower definition object also storing live tower health
- a unit definition object also storing runtime target references
- mixing config and state in the same record

### Why this is bad
Static design data and live entity state have different responsibilities and lifecycles.

### Required rule
Keep static definitions separate from runtime state:
- `TowerDefinition` vs `TowerState`
- `UnitDefinition` vs `UnitState`

---

## 7. Speculative Over-Engineering

### Anti-pattern
Adding systems, abstractions, or architecture for features that do not exist yet.

Examples:
- elaborate plugin frameworks before the first playable loop
- event buses without clear need
- generic entity systems for only two entity types
- deep inheritance hierarchies
- advanced dependency injection for a small codebase

### Why this is bad
It slows development, increases maintenance cost, and makes the code harder to reason about.

### Required rule
Build for current needs plus the next obvious extension point.
Do not design for hypothetical distant requirements.

---

## 8. Ambiguous Naming

### Anti-pattern
Using vague or inconsistent names.

Examples:
- `manager`
- `helper`
- `utils`
- `thing`
- `data`
- `entityHandler`
- `simulationManager`

### Why this is bad
Ambiguous names make systems harder to understand and encourage misuse.

### Required rule
Use explicit names aligned with the domain model and coding standards.

---

## 9. Multiple Names for the Same Concept

### Anti-pattern
Introducing synonyms for existing domain concepts.

Examples:
- `CastleState` instead of `BaseState`
- `CharacterState` instead of `UnitState`
- `MatchRoom` instead of `BattleRoom`
- `CoreHealth` instead of `BaseState.hp`

### Why this is bad
Inconsistent vocabulary creates confusion across code, docs, and AI-generated work.

### Required rule
Use the canonical names defined in `/ai/domain-model.md`.

---

## 10. Hidden Architectural Drift

### Anti-pattern
Changing architecture boundaries without updating governance docs.

Examples:
- moving simulation responsibilities into the client
- moving shared contracts into app-local folders
- introducing backend authority over realtime battle logic
- changing room/state ownership patterns without documentation

### Why this is bad
Architecture drift causes long-term inconsistency and confusion for future contributors and AI agents.

### Required rule
Any meaningful architectural change must be documented in:
- relevant docs
- AI governance files if needed
- ADRs when appropriate

---

# Simulation Anti-Patterns

## 11. Frame-Dependent Game Logic

### Anti-pattern
Tying gameplay outcomes directly to render frame timing.

Examples:
- movement based on client FPS
- combat timing based on render loop
- state progression tied to browser frame rate

### Why this is bad
This makes the game nondeterministic and inconsistent across clients.

### Required rule
Simulation must run on the fixed server tick.

---

## 12. Unseeded or Uncontrolled Randomness

### Anti-pattern
Using randomness in gameplay without a clear plan.

Examples:
- random target selection without deterministic control
- ad hoc `Math.random()` in simulation logic
- random spawn behaviour with no reproducibility

### Why this is bad
Uncontrolled randomness makes simulation harder to test, debug, and replay.

### Required rule
Avoid randomness in core simulation until a deterministic randomness strategy is intentionally introduced.

---

## 13. Physics Engine Dependence for Core Rules

### Anti-pattern
Using a physics engine to determine core lane-based combat rules.

Examples:
- physics collisions deciding lane combat
- physics impulses driving core gameplay movement
- relying on engine collision quirks for combat engagement

### Why this is bad
For this project, gameplay is lane-based and should remain deterministic and explicit.

### Required rule
Use simple deterministic numeric simulation for core gameplay.

---

## 14. Implicit Command Side Effects

### Anti-pattern
Commands causing hidden or unrelated state changes.

Examples:
- placing a tower also unexpectedly mutates unrelated systems
- removing a tower silently alters room phase
- a command triggers hidden economy or balance adjustments not represented clearly

### Why this is bad
Implicit side effects make simulation difficult to reason about.

### Required rule
Command effects should be explicit, bounded, and readable.

---

## 15. Permanent Growth of Dead Entities

### Anti-pattern
Leaving destroyed or obsolete entities in active state forever.

Examples:
- dead units never removed
- destroyed towers still processed
- stale targets preserved indefinitely

### Why this is bad
It causes state bloat and simulation bugs.

### Required rule
Destroyed or inactive entities must be cleaned up predictably.

---

# Client Anti-Patterns

## 16. Raw Networking Inside Scenes

### Anti-pattern
Embedding raw Colyseus room logic directly throughout Phaser scenes.

Examples:
- scenes directly calling room methods everywhere
- state listeners spread across unrelated rendering code
- networking and rendering tightly coupled

### Why this is bad
It makes the client hard to maintain and hard to test.

### Required rule
Keep a dedicated networking layer or room client abstraction between transport and scene logic.

---

## 17. Client-Side Mutation of Authoritative State

### Anti-pattern
Mutating synchronized authoritative state on the client as if it were local truth.

Examples:
- manually adjusting health values in render code
- modifying authoritative entity positions locally
- directly editing room-derived data structures to change game outcomes

### Why this is bad
This creates confusion between displayed state and authoritative state.

### Required rule
Client-side derived or presentation state must be clearly separated from authoritative synchronized state.

---

## 18. Premature UI Polish Before Gameplay Validation

### Anti-pattern
Spending large effort on polished visuals before the simulation contract is proven.

Examples:
- advanced VFX before core combat works
- polished menus before room lifecycle is stable
- high-effort asset integration before the game loop is validated

### Why this is bad
It can hide fundamental gameplay and architecture problems.

### Required rule
Validate architecture and gameplay loop first, then polish.

---

# Process Anti-Patterns

## 19. Large Unscoped Refactors

### Anti-pattern
Refactoring large areas of the codebase while implementing a small feature.

Examples:
- reorganizing the whole repo during a unit combat task
- renaming broad systems without strong reason
- rewriting stable modules unrelated to the requested work

### Why this is bad
It increases risk and makes reviews harder.

### Required rule
Keep changes scoped to the task unless broader refactoring is explicitly justified.

---

## 20. Code Without Documentation Updates

### Anti-pattern
Changing system behaviour without updating documentation.

Examples:
- modifying simulation rules without updating `/project/simulation`
- changing gameplay behaviour without updating `/project/systems`
- changing architecture without updating `/project/docs`

### Why this is bad
The repo is designed for human and AI collaboration.
Outdated docs degrade both.

### Required rule
Update relevant documentation whenever behaviour or structure changes.

---

## 21. Ignoring Existing Governance Files

### Anti-pattern
Making changes without following:
- `AGENTS.md`
- `/ai/coding-standards.md`
- `/ai/domain-model.md`
- `/ai/system-prompts.md`
- `/ai/repository-rules.md`

### Why this is bad
It breaks consistency and weakens the value of the repository’s governance layer.

### Required rule
All changes must align with repository governance files.

---

## 22. Expanding Scope Instead of Creating Tasks

### Anti-pattern
Bundling unrelated future work into the current implementation.

Examples:
- adding economy, matchmaking, and combat during a tower placement task
- implementing future replay support while building the basic room loop

### Why this is bad
It creates bloated changes and unclear priorities.

### Required rule
When new work emerges naturally, create follow-up task files rather than silently expanding scope.

---

# Review Heuristics

Before making changes, ask:

1. Does this preserve server authority?
2. Does this keep the simulation deterministic?
3. Does this respect shared/client/server boundaries?
4. Does this align with the domain model?
5. Is this the simplest correct implementation for the current phase?
6. Have the docs been updated if behaviour changed?

If the answer to any of these is “no” or “unclear,” reconsider the change.

---

# Final Principle

Avoiding anti-patterns is not just about code quality.

It is how this project preserves:
- multiplayer fairness
- simulation correctness
- maintainability
- AI consistency over time

When in doubt, choose the option that is:
- simpler
- clearer
- more explicit
- more server-authoritative
- more deterministic