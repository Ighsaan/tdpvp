# Title
Polish First Playable Match Loop

## Status
Backlog

## Description
The first real simulation contract is implemented, but playtest quality and usability need refinement for repeatable internal matches.

## Goal
Polish the first playable loop from room start to match end with improved clarity, pacing, and validation tooling.

## Acceptance Criteria
- Match flow from ready state to match end is stable for repeated sessions.
- Core HUD/debug elements surface base HP, lane pressure, and phase clearly.
- Command rejection reasons are visible and actionable for test players.
- Simulation pacing is tuned for short internal playtests.
- Known MVP blockers are captured as follow-up tasks.

## Technical Notes
- Keep architecture boundaries intact; no client-authoritative shortcuts.
- Prioritize stability and clarity over feature expansion.
- Use telemetry/debug output to guide adjustments.

## Dependencies
- `/project/tasks/task-0006-build-tower-placement-ui-controls.md`
- `/project/tasks/task-0007-implement-tower-economy-system.md`
- `/project/tasks/task-0008-expand-combat-stats-and-balance.md`

## Docs to Update
- `/project/docs/implementation-foundation.md`
- `/project/docs/roadmap.md`
- `/project/tasks/README.md` (if workflow adjustments are needed)

## Validation Plan
- Multi-match manual playtest sessions with two clients.
- Regression checks for deterministic outcomes under repeated command sequences.
