# Title
Improve Desktop Update Progress UX

## Status
Backlog

## Description
Desktop update flow currently uses a simple startup prompt and install path without explicit progress indicators.

## Goal
Add a lightweight progress UI for download/install states and clearer post-install messaging.

## Acceptance Criteria
- Update prompt includes progress feedback during download/install.
- Failure states provide actionable user-facing guidance.
- Web runtime remains unaffected.

## Technical Notes
- Keep updater integration inside a desktop-specific abstraction.
- Avoid introducing complex settings systems in this phase.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`
- `/project/docs/react-ui-shell-flow.md`

## Docs to Update
- `/project/docs/react-ui-shell-flow.md`
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Simulate slow network update and verify visible progress states.
- Confirm no regressions in startup flow when no update is available.
