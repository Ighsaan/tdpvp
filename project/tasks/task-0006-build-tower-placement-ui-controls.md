# Title
Build Tower Placement UX and Input Flow

## Status
Backlog

## Description
Tower placement currently uses developer hotkeys with fixed placement positions. A clearer in-client placement flow is needed for playtesting and future onboarding.

## Goal
Implement a minimal but explicit tower placement interaction model in the client, including lane selection feedback and placement previews.

## Acceptance Criteria
- Client shows selected lane and selected tower type clearly.
- Placement preview indicates valid vs invalid placement zone before command send.
- Player can place and remove towers without relying on hidden debug assumptions.
- Input pipeline remains intent-only and sends authoritative `place_tower` and `remove_tower` commands.

## Technical Notes
- Keep server authority unchanged; client preview is advisory only.
- Avoid implementing full polished UI in this task.
- Use existing shared contracts and avoid duplicating message types.

## Dependencies
- `/project/docs/implementation-foundation.md`
- `/project/tasks/task-0001-expand-player-command-pipeline.md`

## Docs to Update
- `/project/docs/implementation-foundation.md`
- `/project/docs/gameplay-design.md`

## Validation Plan
- Manual two-client smoke test for placement/remove flows.
- Verify invalid client previews still fail safely server-side.
