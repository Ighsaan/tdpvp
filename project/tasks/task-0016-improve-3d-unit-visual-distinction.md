# Title
Improve 3D Unit Visual Distinction and Readability

## Status
Backlog

## Description
Current unit visuals are intentionally simple placeholder spheres. As 3D matches become denser, better unit readability is needed for quick tactical interpretation.

## Goal
Improve unit visual clarity while preserving authoritative state-driven rendering and deterministic gameplay semantics.

## Acceptance Criteria
- Unit visuals better communicate side ownership and lane context.
- Visual upgrades remain purely presentational.
- No gameplay logic is moved into client rendering code.
- Updated documentation captures visual conventions.

## Technical Notes
- Keep meshes/materials lightweight.
- Prioritize readability over art complexity.
- Preserve canonical lane-based placement.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual visual inspection across all lanes.
- Regression check that authoritative snapshot mapping remains unchanged.
