# Title
Add Basic 3D Combat Attack Cues

## Status
Backlog

## Description
Combat outcomes are authoritative and already simulated server-side, but visual feedback for attacks is minimal.

## Goal
Add lightweight attack cues (flash, pulse, simple impact indicators) driven by authoritative state timing/events.

## Acceptance Criteria
- Units/towers show basic visual attack cues during combat windows.
- Cues do not become gameplay authority.
- No physics-driven combat logic is introduced.

## Technical Notes
- Keep effects simple and low-cost.
- Prefer deterministic event/state triggers from authoritative data.

## Dependencies
- `/project/tasks/task-0015-convert-client-to-threejs-3d-presentation.md`
- `/project/simulation/game-loop.md`

## Docs to Update
- `/project/docs/client-3d-rendering.md`

## Validation Plan
- Manual combat playback checks in multi-lane scenarios.
- Ensure no command/state schema drift.
