# Title
Add Invalid/Expired Match Code Recovery Flow

## Status
Backlog

## Description
Users need stronger recovery paths when attempting to join old or expired match codes.

## Goal
Provide robust recovery guidance and flow continuity for invalid/expired code scenarios.

## Acceptance Criteria
- Expired/missing code responses are clearly surfaced.
- Join screen offers retry and create-new-match shortcuts.
- Recovery flow does not trap users in dead-end states.

## Dependencies
- `/project/tasks/task-0023-improve-join-match-error-and-recovery-states.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`

## Validation Plan
- Manual stale code and missing room recovery testing.
