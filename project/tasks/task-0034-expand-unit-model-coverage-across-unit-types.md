# Title
Expand Unit Model Coverage Across Unit Types

## Status
Done

## Description
The initial pipeline supports one modeled unit type. Additional unit types still use placeholder visuals and need model registry coverage.

## Goal
Add model definitions and mapped animations for remaining unit types using the established registry and loader pipeline.

## Acceptance Criteria
- Additional unit types are configured in the model registry.
- Placeholder fallback usage is reduced and tracked.
- New model definitions include transform corrections and clip mapping docs.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual visual checks per unit type and lane orientation.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/apps/client/src/game/entities/unit-visual-system.ts`
- `/project/docs/client-3d-rendering.md`
