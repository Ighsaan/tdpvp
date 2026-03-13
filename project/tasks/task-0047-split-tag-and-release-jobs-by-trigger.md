# Title
Split Client Tagging and Release Jobs by Trigger

## Status
Done

## Description
Tag preparation and desktop release publishing were both running on both push and manual events, which did not match the intended release control model.

## Goal
Run tag preparation only on push to `main`, and run desktop release publishing only on manual dispatch.

## Acceptance Criteria
- `prepare-release-tag` executes only for `push` on `main`.
- `release-client-desktop` executes only for `workflow_dispatch` on `main`.
- Manual release resolves version tag from Cargo and verifies it exists.
- Documentation reflects the split trigger model and release flow.

## Technical Notes
- Release scope remains client-only.
- Tag source remains `project/apps/client/src-tauri/Cargo.toml`.

## Dependencies
- `/project/tasks/task-0046-drive-client-release-tag-from-cargo-version-on-main.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Validate workflow event guards and release step tag wiring.
- Validate docs align with workflow behavior.

## Validation Notes
- Added per-job `if` guards for event/ref.
- Added manual release tag resolution + existence check before tauri-action publish.

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
