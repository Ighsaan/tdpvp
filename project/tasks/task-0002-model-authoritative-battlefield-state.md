# Title
Model Authoritative Battlefield and Unit State

## Status
Backlog

## Description
The current room state stores only placeholder units. A more complete state model is required to support deterministic movement/combat systems in later phases.

## Goal
Define and implement a minimal authoritative battlefield state model with typed entities, lanes, and lifecycle metadata suitable for deterministic simulation expansion.

## Acceptance Criteria
- Shared state contracts define authoritative entity and battlefield structures.
- Server room state includes lane/objective scaffolding and typed entity collections.
- Entity lifecycle fields (spawn tick, owner, status flags) are explicit and validated.
- Snapshot payloads remain compact and serializable.
- Documentation reflects the updated state model and constraints.

## Technical Notes
- Keep this task focused on state modeling, not full combat behavior.
- Favor explicit field naming and deterministic-friendly structures.
- Avoid hidden derived fields in replicated payloads.

## Dependencies
- `/project/schemas/game-state-schema.md`
- `/project/schemas/player-state-schema.md`
- `/project/simulation/deterministic-simulation.md`

## Docs to Update
- `/project/schemas/game-state-schema.md`
- `/project/schemas/player-state-schema.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Add snapshot serialization tests.
- Add deterministic state-transition smoke tests for entity add/remove flows.
