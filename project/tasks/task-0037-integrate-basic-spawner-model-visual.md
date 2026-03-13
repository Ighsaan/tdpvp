# Title
Integrate `spawner-ninja.glb` for Basic Spawner Tower Visual

## Status
Done

## Description
The battlefield now has modeled unit visuals, but basic spawner towers still render as placeholder boxes. We need to use the new `spawner-ninja.glb` asset for the `basic_spawner` tower while keeping `fast_spawner` unchanged for now.

## Goal
Render `basic_spawner` towers with `spawner-ninja.glb` via a reusable model registry path, with fallback placeholder behavior preserved.

## Acceptance Criteria
- `basic_spawner` uses `/project/apps/client/public/assets/models/spawners/spawner-ninja.glb`.
- `fast_spawner` remains on placeholder rendering.
- Tower visuals remain authoritative-state driven with no gameplay logic moved to client rendering.
- Missing registry/model failures fall back to placeholders with concise warnings.
- Documentation is updated to describe spawner model storage and registry coverage.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/tower-model-registry.ts`
- `/project/apps/client/src/game/entities/tower-visual-system.ts`
- `/project/docs/client-3d-rendering.md`
