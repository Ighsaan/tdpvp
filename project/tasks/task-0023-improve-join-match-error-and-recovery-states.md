# Title
Improve Join Match Error and Recovery States

## Status
Backlog

## Description
Join failures currently surface baseline errors but need clearer recovery UX.

## Goal
Provide actionable join failure states and retry/back guidance.

## Acceptance Criteria
- Invalid/full/missing code errors are distinct and readable.
- UI offers clear retry/back paths.
- Error handling remains consistent with authoritative server responses.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`

## Validation Plan
- Manual tests for invalid, full, and stale code scenarios.
