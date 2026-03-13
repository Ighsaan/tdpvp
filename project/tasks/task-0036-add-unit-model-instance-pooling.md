# Title
Add Unit Model Instance Pooling

## Status
Done

## Description
Frequent unit spawn/despawn cycles can create avoidable allocation pressure from repeated model clone and disposal operations.

## Goal
Introduce model instance pooling for eligible unit visuals to reduce allocation churn while preserving correctness and cleanup safety.

## Acceptance Criteria
- Pooling strategy supports skinned model instances safely.
- Pool lifecycle is bounded and avoids stale transform/animation state leaks.
- Fallback path remains available when pooled instances are exhausted.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`
- `/project/tasks/task-0035-optimize-unit-model-rendering-performance.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Stress test with high spawn/despawn rates and leak checks.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/rendering/model-asset-loader.ts`
- `/project/apps/client/src/game/entities/unit-visual-controller.ts`
- `/project/apps/client/src/game/entities/unit-visual-system.ts`
- `/project/docs/client-3d-rendering.md`

## Notes
- Added bounded per-asset pooling with reset-on-release safeguards.
- Added drop behavior when pools hit max size to avoid unbounded memory growth.
