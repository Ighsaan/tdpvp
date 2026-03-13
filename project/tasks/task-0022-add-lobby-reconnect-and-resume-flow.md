# Title
Add Lobby Reconnect and Resume Flow

## Status
Backlog

## Description
Users should be able to recover into an active lobby session after temporary disconnects.

## Goal
Implement reconnect/resume behavior for lobby state and UI restoration.

## Acceptance Criteria
- Reconnected user returns to lobby with authoritative state.
- Host/non-host roles remain correct after reconnect.
- React shell restores appropriate screen without manual refresh workarounds.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`

## Validation Plan
- Manual disconnect/reconnect tests for host and non-host.
