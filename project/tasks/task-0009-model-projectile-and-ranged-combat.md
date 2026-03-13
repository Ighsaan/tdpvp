# Title
Model Projectile and Ranged Combat Layer

## Status
Backlog

## Description
Current combat is direct hit resolution. Ranged/projectile modeling is needed to support richer tower and unit archetypes.

## Goal
Introduce a deterministic projectile/ranged combat contract compatible with lane-based simulation.

## Acceptance Criteria
- Shared and server state schemas include projectile entities if required by ranged rules.
- Simulation step order cleanly incorporates projectile update and hit resolution.
- Ranged attacks remain server-authoritative and deterministic.
- Existing melee/direct-hit behavior remains compatible.

## Technical Notes
- Avoid physics-engine dependency for projectile movement.
- Prefer lane-relative deterministic projectile travel models.
- Keep projectile lifecycle explicit (spawn, travel, impact, cleanup).

## Dependencies
- `/project/tasks/task-0008-expand-combat-stats-and-balance.md`
- `/project/simulation/game-loop.md`
- `/project/systems/combat-system.md`

## Docs to Update
- `/project/simulation/game-loop.md`
- `/project/systems/combat-system.md`
- `/project/schemas/game-state-schema.md`

## Validation Plan
- Deterministic projectile travel/impact tests.
- Regression tests for non-projectile units.
