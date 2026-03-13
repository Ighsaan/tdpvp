# Title
Expand Authoritative Player Command Pipeline

## Status
Backlog

## Description
The current scaffold supports only ready, ping, and placeholder spawn commands. The next phase must expand the command pipeline to support richer gameplay intent while preserving deterministic ordering and strict server-side validation.

## Goal
Introduce an extensible command model and server execution pipeline that can safely handle additional gameplay intents (tower placement, ability cast stubs, and command sequencing metadata).

## Acceptance Criteria
- Shared command contracts in `/project/packages/shared` include new gameplay intent stubs with explicit payload shapes.
- Server command intake validates payload shape, ownership, and phase legality for each new command type.
- Command queue processing remains deterministic and testable.
- Invalid commands emit typed rejection reasons without mutating state.
- Documentation updates capture new command lifecycle and validation policy.

## Technical Notes
- Keep command handling deterministic and tick-driven.
- Do not implement full gameplay outcomes yet; implement validated intent handling and state-safe stubs.
- Avoid coupling command parsing directly to simulation rule code.

## Dependencies
- `/project/tasks/task-0002-model-authoritative-battlefield-state.md` (recommended parallel planning, not hard-blocking)
- `/project/docs/networking-model.md`
- `/project/schemas/network-messages.md`

## Docs to Update
- `/project/docs/networking-model.md`
- `/project/schemas/network-messages.md`
- `/project/docs/implementation-foundation.md`

## Validation Plan
- Add unit tests for command validators and rejection paths.
- Add integration tests for command queue ordering under simultaneous command load.
