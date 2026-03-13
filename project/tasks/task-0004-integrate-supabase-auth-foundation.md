# Title
Integrate Supabase Authentication Foundation

## Status
Backlog

## Description
The realtime scaffold currently has no authenticated identity flow. A lightweight Supabase auth foundation is needed before progression and persistent systems can be trusted.

## Goal
Introduce authenticated player identity plumbing between client, backend services, and server room join flow without adding full persistence/progression logic yet.

## Acceptance Criteria
- Client can obtain and manage authenticated session tokens.
- Server join path validates auth context before assigning authoritative player identity.
- Shared session/auth context contracts are defined where cross-boundary.
- Unauthorized joins are rejected with explicit reason paths.
- Documentation clearly defines current auth boundaries and deferred persistence work.

## Technical Notes
- Keep live simulation authority in server runtime; Supabase remains identity source and persistence platform.
- Do not implement ranking/progression pipelines in this task.
- Ensure token/session handling does not leak sensitive data in room state.

## Dependencies
- `/project/docs/architecture-overview.md`
- `/project/docs/multiplayer-design.md`
- `/ai/architecture.md`

## Docs to Update
- `/project/docs/architecture-overview.md`
- `/project/docs/implementation-foundation.md`
- `/project/docs/multiplayer-design.md`

## Validation Plan
- Integration test for authenticated join success.
- Integration test for rejected join when token is missing/invalid.
