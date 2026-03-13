# Title
Add Authoritative Hit Reaction Animation Triggers

## Status
Done

## Description
Hit reaction clips exist in art assets, but current snapshots do not provide an explicit visual hit trigger pathway for client animation timing.

## Goal
Define and implement a clean, authoritative-compatible signal path to trigger hit reaction animations for unit visuals.

## Acceptance Criteria
- Hit reaction triggers are driven by authoritative state/event data.
- No client-authored combat outcomes are introduced.
- Trigger behavior is documented with edge cases (multiple hits, rapid repeats).
- Fallback behavior is defined when trigger data is absent.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`
- `/project/schemas/network-messages.md` (if event payload contracts change)

## Validation Plan
- Manual and test coverage for repeated hit scenarios and reconciliation stability.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/unit-visual-controller.ts`
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/docs/client-3d-rendering.md`

## Notes
- Hit reaction triggers currently use authoritative HP deltas from snapshots, with per-model cooldown gating.
- No shared schema changes were required for this implementation.
