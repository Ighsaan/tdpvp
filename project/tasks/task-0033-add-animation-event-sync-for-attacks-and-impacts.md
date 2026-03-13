# Title
Add Animation Event Sync for Attack Windup and Impact Timing

## Status
Done

## Description
Attack animations currently play as visual cues only. Future polish requires synchronized animation events for windup/impact timing cues while preserving server-authoritative outcomes.

## Goal
Add a client-side animation event sync layer that can react to authoritative attack/hit events for better feedback timing.

## Acceptance Criteria
- Animation event hooks can be mapped per clip for key moments.
- Event sync remains presentation-only and never changes simulation outcomes.
- Mapping and usage are documented for future model integrations.

## Dependencies
- `/project/tasks/task-0030-add-first-animated-unit-model-pipeline.md`
- `/project/tasks/task-0032-add-authoritative-hit-reaction-animation-triggers.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual timing verification between authoritative events and rendered animation moments.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`

## Delivered References
- `/project/apps/client/src/game/entities/unit-model-registry.ts`
- `/project/apps/client/src/game/entities/unit-visual-controller.ts`
- `/project/docs/client-3d-rendering.md`

## Notes
- Attack clip markers (`windup`, `impact`) are now data-driven in registry definitions.
- Impact markers currently drive synchronized impact pulse cues as presentation-only feedback.
