# Title
Add 3D Tower Placement Preview and Validity Feedback

## Status
Backlog

## Description
Current tower placement controls work, but players lack clear 3D preview feedback for where the next tower request will be submitted.

## Goal
Render a placement preview marker in 3D for selected lane and candidate position, with clear valid/invalid hints.

## Acceptance Criteria
- Preview marker follows selected lane/placement input state.
- Validity feedback uses authoritative rules mirrored from known placement constraints.
- Final authority remains server-side command validation.

## Technical Notes
- Avoid client-side authoritative placement acceptance.
- Keep visuals aligned with canonical placement zones.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`
- `/project/systems/tower-system.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual lane-by-lane placement preview checks.
- Verify rejected commands still rely on server response.
