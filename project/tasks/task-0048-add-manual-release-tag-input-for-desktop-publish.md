# Title
Drive Manual Desktop Publish Tag via Workflow Ref Selection

## Status
Done

## Description
Manual desktop publishing should target an explicitly selected release tag from workflow dispatch ref selection instead of inferring the tag inside the release job.

## Goal
Require manual release runs to use a selected `client-v*` tag via the GitHub Actions `Use workflow from` selector and publish artifacts to that tag release.

## Acceptance Criteria
- Manual `release-client-desktop` validates workflow ref is a `client-v*` tag.
- Manual release checks out and publishes against the selected tag ref.
- Workflow dispatch no longer requires a custom tag text input.
- Documentation reflects tag selection from `Use workflow from`.

## Technical Notes
- Tag-preparation push flow remains unchanged.
- Release scope remains client-only.

## Dependencies
- `/project/tasks/task-0047-split-tag-and-release-jobs-by-trigger.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Validate workflow YAML and manual input wiring.
- Validate docs alignment with new dispatch contract.

## Validation Notes
- Removed custom manual `release_tag` input from workflow dispatch.
- Added manual release ref validation step for `refs/tags/client-v*`.
- Updated release documentation to require selecting tag in `Use workflow from`.

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
