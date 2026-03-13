# Title
Add Explicit Lobby Leave and Cancel Flow

## Status
Backlog

## Description
Basic leave is available but needs complete UX/authority handling for host and non-host exits.

## Goal
Implement clear leave/cancel paths with deterministic room and UI outcomes.

## Acceptance Criteria
- Non-host leave path returns user cleanly to menus.
- Host leave behavior is authoritative and clearly communicated.
- Remaining players receive synchronized lobby updates.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`

## Validation Plan
- Manual leave tests for host and non-host users.
