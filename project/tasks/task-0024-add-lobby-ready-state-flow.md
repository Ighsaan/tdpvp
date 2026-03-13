# Title
Add Lobby Ready-State Flow for Players

## Status
Backlog

## Description
Future matchmaking polish may require explicit ready checks beyond host start controls.

## Goal
Introduce optional ready-state controls in lobby while preserving host start authority.

## Acceptance Criteria
- Players can toggle ready state in lobby.
- Ready state is authoritative and synchronized.
- Host start behavior integrates cleanly with ready requirements.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`
- `/project/schemas/game-state-schema.md`

## Validation Plan
- Multi-user lobby readiness flow tests.
