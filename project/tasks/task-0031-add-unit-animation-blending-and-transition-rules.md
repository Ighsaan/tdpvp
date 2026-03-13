# Title
Add Unit Animation Blending and Transition Rules

## Status
Done

## Description
Current model animation behavior is intentionally minimal and clip-switch based. We need smooth blending rules for locomotion and action transitions as more animated units are integrated.

## Goal
Introduce maintainable animation blending and transition timing rules for unit visuals without coupling rendering to gameplay authority.

## Acceptance Criteria
- Blend durations and transition priorities are data-driven.
- Movement/action/death transitions reduce visible popping.
- Blending behavior remains presentation-only and deterministic from authoritative snapshot inputs.
- Documentation is updated with blending rules and constraints.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual visual regression checks across walk/attack/death transitions.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/apps/client/src/game/entities/unit-visual-controller.ts`
- `/project/docs/client-3d-rendering.md`
