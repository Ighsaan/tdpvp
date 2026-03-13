# Title
Expand Combat Stats and Initial Balance Pass

## Status
Backlog

## Description
Combat currently uses minimal baseline values for two unit types. Additional stat controls and first-pass balancing are needed before broader playtests.

## Goal
Expand data-driven combat parameters and run a first balancing pass across spawn cadence, unit durability, and base pressure.

## Acceptance Criteria
- Unit and tower definition schema supports expanded combat tuning parameters.
- Server simulation consumes the expanded definitions without behavioral regressions.
- Baseline balance targets are documented for match pacing and base time-to-kill.
- Known overpowered/underpowered extremes are reduced in playtest runs.

## Technical Notes
- Keep deterministic simulation behavior unchanged.
- Prefer data definition changes over hardcoded logic forks.
- Record assumptions and tuning rationale.

## Dependencies
- `/project/tasks/task-0007-implement-tower-economy-system.md`
- `/project/systems/combat-system.md`
- `/project/systems/units-system.md`

## Docs to Update
- `/project/systems/combat-system.md`
- `/project/systems/units-system.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Repeatable simulation test scenarios with fixed seeds/inputs.
- Comparative telemetry before/after tuning changes.
