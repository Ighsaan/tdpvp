# Title
Add Selection and Lane Highlight Feedback in 3D Client

## Status
Backlog

## Description
Lane selection currently has only minimal visual indication. Additional selection/highlight cues will improve tactical usability.

## Goal
Improve lane and entity selection feedback in 3D presentation while preserving existing controls and authoritative flow.

## Acceptance Criteria
- Selected lane highlight is visually clear under all camera and lighting conditions.
- Optional hover/select highlights for towers/units are presentation-only.
- Input-to-selection mapping remains stable and deterministic from client perspective.

## Technical Notes
- Keep highlight shaders/material changes simple.
- No gameplay outcomes depend on client-only selection state.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual readability checks on desktop and smaller viewport sizes.
- Verify no regression in tower placement/removal commands.
