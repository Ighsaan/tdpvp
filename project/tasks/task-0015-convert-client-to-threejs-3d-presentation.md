# Title
Convert `/project/apps/client` from 2D Phaser Presentation to 3D ThreeJS Presentation

## Status
Done

## Description
The primary client currently presents gameplay through a 2D Phaser debug visualization. We need to migrate this client to a ThreeJS 3D fixed-angle presentation while preserving server-authoritative lane-based simulation behavior and existing shared contracts.

## Goal
Make `/project/apps/client` the canonical ThreeJS-rendered client with a fixed strategic camera, 3D battlefield representation, and unchanged authoritative multiplayer flow.

## Acceptance Criteria
- `/project/apps/client` uses ThreeJS for primary gameplay rendering.
- Existing command flow remains intact: `ready`, `ping`, `place_tower`, `remove_tower`.
- Battlefield renders lanes, left/right bases, placement zones, neutral zone, towers, and units in 3D.
- Camera is fixed, stable, and keeps left/right base readability.
- Client architecture clearly separates networking, state consumption, rendering, camera, entities, and HUD/debug view.
- Server authority and shared contracts remain unchanged.
- Relevant docs and architecture references are updated.
- Follow-up 3D backlog tasks are created under `/project/tasks`.

## Technical Notes
- This migration is presentation-only and must not move gameplay logic into the client.
- Keep placeholder visuals simple and developer-friendly.
- Preserve canonical world orientation (X progression, Z lanes, Y height).

## Dependencies
- `/project/tasks/task-0003-render-authoritative-entities-on-client.md`
- `/project/tasks/task-0005-build-first-playable-combat-loop.md`

## Docs to Update
- `/project/docs/architecture-overview.md`
- `/project/docs/implementation-foundation.md`
- `/project/docs/networking-model.md`
- `/project/README.md`
- `/ai/architecture.md`

## Validation Plan
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`
- `npm run typecheck --prefix project`
- `npm run build --prefix project`

## Assumptions
- Shared contracts remain sufficient for rendering without schema changes.

## Validation Notes
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`
- `npm run typecheck --prefix project`
- `npm run build --prefix project`

## Delivered References
- `/project/docs/client-3d-rendering.md`
- `/project/decisions/adr-0002-threejs-primary-client-rendering.md`
