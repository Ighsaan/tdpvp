# Title
Inject Updater Public Key During Desktop Release Build

## Status
Done

## Description
Desktop release builds failed to decode updater pubkey because `tauri.conf.json` still contained an unresolved placeholder string.

## Goal
Inject `TAURI_UPDATER_PUBLIC_KEY` into `tauri.conf.json` inside the release workflow before running `tauri-action`.

## Acceptance Criteria
- Workflow fails clearly when `TAURI_UPDATER_PUBLIC_KEY` secret is missing or unresolved.
- Workflow writes resolved updater pubkey into `project/apps/client/src-tauri/tauri.conf.json` before build.
- `tauri-action` no longer receives unresolved placeholder pubkey.
- Docs explain secret injection behavior.

## Technical Notes
- Public key remains managed as CI secret input for workflow builds.
- Release scope remains client-only.

## Dependencies
- `/project/tasks/task-0048-add-manual-release-tag-input-for-desktop-publish.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Validate workflow contains pre-build key injection step.
- Validate docs describe injection source.

## Validation Notes
- Added explicit workflow step to inject/validate updater public key before `tauri-action`.
- Updated docs secret description to reflect workflow injection behavior.

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
