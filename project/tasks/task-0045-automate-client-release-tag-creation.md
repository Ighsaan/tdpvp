# Title
Automate Client Release Tag Creation from Client Version

## Status
Done

## Description
The desktop client release workflow required manually creating and pushing a release tag before the action could publish artifacts.

## Goal
Make the release workflow create and push a `client-vX.Y.Z` tag automatically from `/project/apps/client/package.json` before running matrix desktop builds.

## Acceptance Criteria
- Release workflow has a preparation job that reads client version and computes `client-vX.Y.Z`.
- Workflow creates/pushes the computed tag when missing.
- Workflow fails clearly if that tag already exists.
- Release matrix job publishes using the computed tag output.
- Documentation describes the manual-dispatch-first flow and automated tag creation.

## Technical Notes
- Keep release scope client-only.
- Maintain updater artifact publishing behavior.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Validate workflow file structure and output wiring.
- Confirm docs reference workflow_dispatch + automated tag creation.

## Validation Notes
- Updated `/.github/workflows/client-desktop-release.yml` with `prepare-release-tag` output dependency.
- Verified release job uses `${{ needs.prepare-release-tag.outputs.tag_name }}` for tag/release names.
- Updated release process docs to remove manual tag push step.

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
