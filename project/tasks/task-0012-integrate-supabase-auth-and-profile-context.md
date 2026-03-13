# Title
Integrate Supabase Auth and Profile Context

## Status
Backlog

## Description
Simulation currently runs without authenticated identity context. Authenticated profile linkage is required before progression and persistence can be trusted.

## Goal
Integrate Supabase-backed authentication context into room join flow and player identity mapping.

## Acceptance Criteria
- Client obtains and forwards auth context during room join.
- Server validates auth context before assigning authoritative player identity.
- Player profile references are available in non-simulation metadata paths.
- Unauthorized joins are rejected with explicit error handling.

## Technical Notes
- Keep live battle simulation authority on server runtime only.
- Do not implement full progression or match persistence in this task.
- Avoid leaking sensitive auth tokens into room snapshots.

## Dependencies
- `/project/tasks/task-0004-integrate-supabase-auth-foundation.md`
- `/project/docs/multiplayer-design.md`
- `/project/docs/architecture-overview.md`

## Docs to Update
- `/project/docs/architecture-overview.md`
- `/project/docs/multiplayer-design.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Integration tests for valid/invalid authenticated joins.
- Manual reconnect validation with authenticated sessions.
