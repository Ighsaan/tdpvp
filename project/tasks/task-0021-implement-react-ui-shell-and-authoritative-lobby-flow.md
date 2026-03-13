# Title
Implement React UI Shell and Authoritative Lobby Flow

## Status
Done

## Description
Introduce a React-based frontend shell for non-battle product flow (onboarding, menus, settings, create/join, lobby) while preserving authoritative Colyseus battle simulation and ThreeJS gameplay rendering.

## Goal
Deliver a clean split where React handles app-like UI/navigation and the existing ThreeJS renderer mounts for active battle phase only.

## Acceptance Criteria
- React screens exist for onboarding, main menu, play menu, join match, settings, and lobby.
- Username onboarding/settings flow is locally persisted with validation.
- Match create/join by 5-character uppercase alphanumeric code works through authoritative server flow.
- Server owns lobby creation, code lookup, host assignment, lane count update validation, and start match validation.
- Lobby shows match code, host identity, player list, lane count, and host-only actions.
- Host can set lane count (2-6) and start game.
- Battle renderer remains isolated from React menu shell and mounts during active phase.
- Shared contracts and docs are updated for lobby/host/code/lane/start behavior.

## Technical Notes
- Keep server authority intact; React is presentation only.
- Avoid direct raw Colyseus calls spread across UI components.
- Keep solution minimal and extendable for reconnect/polish follow-up tasks.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`
- `/project/decisions/adr-0002-threejs-primary-client-rendering.md`

## Docs to Update
- `/project/docs/architecture-overview.md`
- `/project/docs/implementation-foundation.md`
- `/project/docs/networking-model.md`
- `/project/docs/client-3d-rendering.md`
- `/project/schemas/network-messages.md`
- `/project/schemas/game-state-schema.md`
- `/project/schemas/player-state-schema.md`
- `/ai/architecture.md`
- `/ai/coding-standards.md`

## Validation Plan
- `npm run typecheck --prefix project`
- `npm run build --prefix project`

## Assumptions
- Local username persistence is acceptable for this phase.
- Lobby uses existing `BattleRoom` with authoritative pre-match flow extensions instead of introducing a separate room type.

## Validation Notes
- `npm run typecheck --prefix project`
- `npm run build --prefix project`

## Delivered References
- `/project/docs/react-ui-shell-flow.md`
- `/project/apps/client/src/app`
- `/project/apps/server/src/services/match-code-service.ts`
