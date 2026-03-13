# Title
Add First Animated Unit Model Pipeline with `spawn-ninja.glb`

## Status
Done

## Description
The primary ThreeJS client currently renders units as primitive placeholders only. We need to integrate the first production GLB unit model while building a reusable, scalable model and animation pipeline for additional unit art.

## Goal
Render one unit type with `spawn-ninja.glb` using a reusable model loader, model registry, and per-unit visual controller while preserving authoritative server state ownership and placeholder fallback behavior.

## Acceptance Criteria
- `spawn-ninja.glb` is loaded from `/project/apps/client/public/assets/models/units/spawn-ninja.glb`.
- GLB assets are loaded through a reusable loader that caches source assets and clones scene instances for units.
- Unit model definitions are data-driven through a client-side registry keyed by unit type.
- Internal animation vocabulary (`idle`, `walk`, `attackPrimary`, `attackSecondary`, `hitReact`, `death`) is defined and source clips are mapped for `spawn-ninja.glb`.
- Unit visuals use one `AnimationMixer` per visual instance lifecycle and mixers are advanced by the global render loop.
- At least one unit type renders via the model pipeline and other unit types continue rendering with primitive fallback visuals.
- Developer warnings exist for missing registry entries, missing clips, and fallback usage.
- Documentation explains model storage conventions, registry usage, clip mapping, loader cache lifecycle, and extension steps for new models.
- Follow-up backlog tasks are created for blending, hit reaction triggers, animation event sync, additional model coverage, performance optimization, and pooling.

## Technical Notes
- This is presentation-only work; no gameplay authority or simulation behavior moves from server to client.
- Unit transform correction must come from model definitions, not per-frame hardcoded hacks.
- Keep animation behavior minimal and deterministic in response to authoritative state snapshots.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`
- `/project/tasks/task-0016-improve-3d-unit-visual-distinction.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Assumptions
- Existing unit snapshot data (`positionX`, `targetUnitId`, `attackCooldownRemainingTicks`, `status`) is sufficient for minimal visual animation triggering without schema changes.

## Validation Notes
- `npm run typecheck --prefix project`
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/rendering/model-asset-loader.ts`
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/apps/client/src/game/entities/unit-visual-controller.ts`
- `/project/apps/client/src/game/entities/unit-visual-system.ts`
- `/project/docs/client-3d-rendering.md`
- `/project/tasks/task-0031-add-unit-animation-blending-and-transition-rules.md`
- `/project/tasks/task-0032-add-authoritative-hit-reaction-animation-triggers.md`
- `/project/tasks/task-0033-add-animation-event-sync-for-attacks-and-impacts.md`
- `/project/tasks/task-0034-expand-unit-model-coverage-across-unit-types.md`
- `/project/tasks/task-0035-optimize-unit-model-rendering-performance.md`
- `/project/tasks/task-0036-add-unit-model-instance-pooling.md`
