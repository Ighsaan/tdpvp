# Title
Add Manual Release Tag Input for Desktop Publish Job

## Status
Done

## Description
Manual desktop publishing should target an explicitly selected release tag instead of inferring the tag inside the release job.

## Goal
Require a `release_tag` workflow input for the manual release job and publish artifacts to that specific tag release.

## Acceptance Criteria
- Workflow dispatch includes required `release_tag` input.
- Manual `release-client-desktop` validates tag format.
- Manual release checks out and publishes against the provided tag.
- Documentation reflects the required manual tag input.

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
- Added required `workflow_dispatch.inputs.release_tag`.
- Added manual release tag validation step and checkout ref binding.
- Updated release documentation to require `release_tag` on manual publish.

## Delivered References
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
