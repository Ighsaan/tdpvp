# Title
Optimize Unit Model Rendering Performance for Dense Battles

## Status
Done

## Description
Animated skinned models increase CPU and GPU cost compared to primitive placeholders. Performance guardrails are required as model usage scales.

## Goal
Profile and optimize unit model rendering to maintain stable frame pacing under high unit counts.

## Acceptance Criteria
- Baseline and optimized performance metrics are captured.
- Material/shadow/animation update costs are reviewed and tuned.
- Optimization decisions are documented with tradeoffs.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`
- `/project/tasks/task-0034-expand-unit-model-coverage-across-unit-types.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Scenario-based profiling with dense lane populations.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/unit-visual-system.ts`
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/apps/client/src/game/rendering/model-asset-loader.ts`
- `/project/apps/client/src/game/rendering/three-battlefield-scene.ts`
- `/project/docs/client-3d-rendering.md`

## Notes
- Added runtime model pool stats for profiling clone/reuse/drop behavior.
- Reduced per-frame allocation in unit snapshot mapping by reusing scratch structures.
- Tuned model render profile defaults to avoid unnecessary receive-shadow cost on units.
