# Title
Build First Playable Authoritative Combat Loop

## Status
Backlog

## Description
After command and state foundations are expanded, the project needs its first playable combat loop to validate full authoritative gameplay flow.

## Goal
Implement a minimal but playable server-authoritative combat loop with unit progression, basic targeting, damage resolution, and a simple win condition.

## Acceptance Criteria
- Server tick loop executes deterministic movement/targeting/combat steps.
- Client can issue spawn intent and observe authoritative combat outcomes.
- Basic objective health and match-end transition are functional.
- Simulation behavior is deterministic under repeated seeded test runs.
- Documentation and schemas capture the implemented combat model.

## Technical Notes
- Keep rules intentionally minimal and tune for clarity over depth in this phase.
- Combat resolution must remain server-authoritative and tick-driven.
- Record key events for replay/debug expansion later.

## Dependencies
- `/project/tasks/task-0001-expand-player-command-pipeline.md`
- `/project/tasks/task-0002-model-authoritative-battlefield-state.md`
- `/project/tasks/task-0003-render-authoritative-entities-on-client.md`
- `/project/simulation/game-loop.md`
- `/project/systems/combat-system.md`

## Docs to Update
- `/project/simulation/game-loop.md`
- `/project/simulation/deterministic-simulation.md`
- `/project/systems/combat-system.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Deterministic simulation tests for combat steps and tie-resolution.
- End-to-end multiplayer smoke test covering room start to match end.
