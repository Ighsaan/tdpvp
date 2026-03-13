# Title
Add Remote Profile Persistence Integration

## Status
Backlog

## Description
Username/profile settings are currently local-only for rapid iteration.

## Goal
Integrate profile identity persistence with backend services while preserving lobby flow behavior.

## Acceptance Criteria
- Profile updates persist remotely.
- Session bootstrap resolves remote profile cleanly.
- Local fallback behavior is defined for offline/unavailable backend states.

## Dependencies
- `/project/tasks/task-0021-implement-react-ui-shell-and-authoritative-lobby-flow.md`
- `/project/tasks/task-0012-integrate-supabase-auth-and-profile-context.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`
- `/project/docs/architecture-overview.md`

## Validation Plan
- Profile update/read-back integration tests.
