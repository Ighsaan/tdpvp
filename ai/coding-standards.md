# Coding Standards

## Scope
These standards define expected implementation quality for future code in this repository.

## TypeScript Standards
- Use TypeScript strict mode for all packages (`strict: true`).
- Disallow implicit `any`.
- Model domain types explicitly; avoid untyped object maps for core gameplay state.
- Prefer readonly data where mutation is not required.
- Use explicit return types on exported functions and public APIs.

## Naming Rules
- Use `kebab-case` for files and folders.
- Use `PascalCase` for classes, schemas, and entity types.
- Use `camelCase` for variables and functions.
- Use `UPPER_SNAKE_CASE` for constants.
- Use clear domain-oriented names (`SpawnUnitCommand`, `BattleRoomState`, `TowerDefinition`).
- Avoid vague names such as `utils`, `helper`, `misc`, `manager`, `thing`, and `data`.
- Prefer explicit names that communicate gameplay intent and ownership boundary.

## Folder Structure Rules
These are the intended structures for implementation code.

### Server
Code root: `/project/apps/server/src`

- `/project/apps/server/src/config`: server and room configuration, environment parsing, and runtime constants.
- `/project/apps/server/src/rooms`: Colyseus room lifecycle and room-level orchestration.
- `/project/apps/server/src/simulation`: deterministic tick pipeline and simulation step execution.
- `/project/apps/server/src/commands`: command validation, parsing, and command-to-action mapping.
- `/project/apps/server/src/entities`: runtime entity models and entity-specific behavior modules.
- `/project/apps/server/src/state`: authoritative runtime state structures and state transition helpers.
- `/project/apps/server/src/services`: infrastructure-facing integrations (telemetry, adapters, external interfaces).
- `/project/apps/server/src/data`: static server-side datasets and non-runtime definition loading.

### Client
Code root: `/project/apps/client/src`

- `/project/apps/client/src/app/screens`: React screen-level UI flows (onboarding, menus, settings, lobby).
- `/project/apps/client/src/app/components`: reusable React UI components.
- `/project/apps/client/src/app/providers`: React providers/context for app-level state.
- `/project/apps/client/src/app/routes`: screen routing/state-orchestration modules.
- `/project/apps/client/src/game/scenes`: client scene composition and scene lifecycle orchestration.
- `/project/apps/client/src/game/rendering`: rendering systems, interpolation, and visual presentation logic.
- `/project/apps/client/src/game/entities`: client-side entity view models and render components.
- `/project/apps/client/src/game/camera`: camera setup and camera behavior modules.
- `/project/apps/client/src/game/ui`: gameplay UI widgets, overlays, and HUD modules.
- `/project/apps/client/src/network`: transport/client-room communication abstractions.
- `/project/apps/client/src/state`: client-side state containers for authoritative snapshot consumption.
- `/project/apps/client/src/config`: client runtime configuration and environment-derived settings.
- `/project/apps/client/src/lib`: small shared client utilities that are not domain models.

### Shared Package
Code root: `/project/packages/shared/src`

- `/project/packages/shared/src/constants`: shared protocol/game constants used by both client and server.
- `/project/packages/shared/src/enums`: canonical enums for shared domain concepts.
- `/project/packages/shared/src/types`: shared interfaces and type aliases for contracts.
- `/project/packages/shared/src/schemas`: shared message/state schema definitions and validation-adjacent structures.
- `/project/packages/shared/src/commands`: command contracts and command-related shared types.

Role of shared package:
- The shared package is the contract boundary between client and server.
- Shared code must contain contracts and cross-boundary primitives only.
- Do not place server-only simulation behavior or client-only rendering logic in shared modules.

## Deterministic Server Logic
- Server simulation must be deterministic from identical initial state + ordered commands.
- Never use non-deterministic sources in simulation paths (random, time, floating-point drift) without controlled strategy.
- Randomness must use seeded/replicable RNG.
- Time progression uses server tick counters or fixed-step simulation time.
- Keep side effects outside pure simulation steps where possible.

## Functional Architecture Preference
- Prefer pure functions for rule resolution (damage, targeting, cooldown checks, resource updates).
- Separate command validation, state transition, and event emission stages.
- Keep orchestration thin and rules composable.
- Avoid hidden mutable global state in server simulation.

## Client and Server Separation
- Client code may predict and interpolate visuals, but cannot finalize gameplay outcomes.
- Server code owns authoritative state transitions.
- Shared types are contract-only; avoid sharing client convenience logic with server simulation core.

## Authority and Anti-Cheat Rules
- Every player command must be validated server-side for:
  - ownership,
  - resource/cooldown availability,
  - positional legality,
  - phase/timing legality.
- Invalid commands are rejected safely and optionally logged for abuse analysis.
- Trust no client-provided combat resolution values.

## Simulation Naming Conventions
- Simulation pipeline functions must use explicit step names that describe the exact operation.
- Preferred function naming examples:
  - `processPlayerCommands`
  - `processTowerSpawning`
  - `processUnitMovement`
  - `processUnitCombat`
  - `processBaseInteractions`
  - `removeDestroyedEntities`
  - `checkWinCondition`
- Avoid vague simulation names such as `updateEverything`, `processGame`, and `handleSimulation`.
- Keep simulation function names verb-led and domain-specific.

## Domain Terminology Rules
Use these canonical domain names consistently:
- `BattleRoom`
- `BattleRoomState`
- `PlayerState`
- `LaneState`
- `TowerState`
- `UnitState`
- `BaseState`

Do not introduce alternate names for the same concept in different modules.

## Data Definition Naming
- Use `PascalCase` for gameplay definition types:
  - `TowerDefinition`
  - `UnitDefinition`
- Use `camelCase` plural names for definition collections:
  - `towerDefinitions`
  - `unitDefinitions`
- Keep static gameplay definitions separate from runtime entity state.
- Runtime state types (`TowerState`, `UnitState`) must not be used as static definition containers.

## Shared Schema Design Rules
- Shared schemas must be explicit, stable, and version-friendly.
- Use nouns for state/schema types and verbs for command/action types.
- Keep shared schemas minimal and boundary-focused; avoid embedding server-only internals.
- Any schema or command contract change must update:
  - `/project/packages/shared`
  - `/project/schemas`
  - relevant docs in `/project/docs`.

## Documentation Terminology Alignment
- Terminology in code must match terminology in:
  - `/project/docs`
  - `/project/systems`
  - `/project/simulation`
- If terminology changes, update code and documentation in the same change set.
- Do not create parallel naming systems between implementation and documentation.

## Error Handling
- Fail closed for invalid gameplay commands.
- Prefer typed result objects for expected invalid states over exceptions in hot paths.
- Reserve exceptions for truly exceptional and unrecoverable conditions.

## Test Expectations
- Add deterministic unit tests for rule logic.
- Add integration tests for command-to-state transitions.
- Include edge cases for ties, simultaneous events, and reconnect scenarios.

## Documentation Expectations
- Public modules require short doc headers describing responsibility and constraints.
- Update related Markdown docs whenever behavior or contracts change.
