# Title
Drive Client Release Tag from Cargo Version on Main Push

## Status
Done

## Description
The release workflow previously used a manually dispatched path and generated tags from `package.json`.

## Goal
Make the desktop release workflow derive version from `src-tauri/Cargo.toml`, run on every push to `main`, and force-overwrite the version tag to track the latest commit.

## Acceptance Criteria
- Workflow triggers on `main` pushes and manual dispatch.
- Tag source is `/project/apps/client/src-tauri/Cargo.toml` `[package].version`.
- Existing tag for that version is force-updated to latest commit.
- Existing GitHub Release for that tag is deleted before publishing fresh artifacts.
- Docs describe updated trigger and tag source behavior.

## Technical Notes
- Release scope remains client-only.
- Matrix artifact publish flow remains unchanged.

## Dependencies
- `/project/tasks/task-0045-automate-client-release-tag-creation.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Validate workflow structure and output wiring.
- Validate docs alignment with workflow behavior.

## Validation Notes
- Updated workflow to parse Cargo version via `awk` from `project/apps/client/src-tauri/Cargo.toml`.
- Added release deletion step (`actions/github-script`) for existing tag release.
- Added force tag update (`git tag -fa` + `git push --force`).

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
