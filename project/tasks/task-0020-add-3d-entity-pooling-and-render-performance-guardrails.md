# Title
Add 3D Entity Pooling and Render Performance Guardrails

## Status
Backlog

## Description
Current MVP mesh lifecycle creates and disposes entities directly. This is acceptable for early testing but can degrade performance under heavier match load.

## Goal
Introduce lightweight pooling/reuse strategy and performance guardrails for towers and units in the 3D client.

## Acceptance Criteria
- Tower/unit mesh lifecycle uses reusable pool strategy where practical.
- Frame-time stability improves in high-entity scenarios.
- Authoritative state mapping correctness is preserved.
- Performance assumptions and limits are documented.

## Technical Notes
- Keep pooling logic explicit and maintainable.
- Avoid speculative optimization outside measured hot paths.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Manual stress tests with high tower/unit counts.
- Compare frame consistency before/after pooling changes.
