# Title
Implement Tower Economy and Purchase Validation

## Status
Backlog

## Description
Tower placement currently uses placeholder cost data without real resource checks. The simulation needs a deterministic economy contract to regulate tower purchases.

## Goal
Add a server-authoritative mana/economy model that validates tower purchases and supports future balancing.

## Acceptance Criteria
- Player state includes authoritative economy fields required for placement validation.
- `place_tower` command enforces resource availability and deducts cost deterministically.
- Economy progression/regeneration is tick-driven and deterministic.
- Rejection reasons are explicit when purchase validation fails.

## Technical Notes
- Keep economy simple in first version (single resource type).
- Avoid coupling economy logic to client render loops.
- Ensure reconnect/snapshot state includes required economy data.

## Dependencies
- `/project/systems/mana-economy.md`
- `/project/schemas/player-state-schema.md`
- `/project/tasks/task-0006-build-tower-placement-ui-controls.md`

## Docs to Update
- `/project/systems/mana-economy.md`
- `/project/schemas/player-state-schema.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Deterministic unit tests for spend/regeneration.
- Integration tests for purchase acceptance/rejection.
