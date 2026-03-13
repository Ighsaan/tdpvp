# Title
Polish Lobby-to-Battle Transition Experience

## Status
Backlog

## Description
Phase transition currently works but can feel abrupt.

## Goal
Improve transition handling between lobby UI shell and mounted battle renderer.

## Acceptance Criteria
- Transition feedback is clear to all players.
- Loading/phase boundary states are handled without UI flicker.
- Authoritative phase remains single source of truth.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Repeated host start transition checks across varied network conditions.
