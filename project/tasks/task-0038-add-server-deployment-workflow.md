# Title
Add Server Deployment GitHub Actions Workflow

## Status
Done

## Description
The current desktop release flow is intentionally client-only. The authoritative Colyseus server still needs a separate deployment pipeline.

## Goal
Create a dedicated server build/deploy workflow with environment-specific rollout controls and rollback support.

## Acceptance Criteria
- Server workflow is isolated from client desktop release workflow.
- Deployment supports production environment rollout via manual workflow dispatch.
- Secrets and runtime env expectations are documented.

## Technical Notes
- Keep authoritative simulation ownership unchanged.
- Avoid coupling server deploy logic to client release pipeline.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`
- `/project/apps/server`

## Docs to Update
- `/project/docs/architecture-overview.md`
- deployment runbook doc to be added in `/project/docs`

## Validation Plan
- Verify deployment in production.
- Confirm room lifecycle and simulation startup health checks pass.

## Validation Notes
- Added `/.github/workflows/server-colyseus-deploy.yml` with:
  - push-to-main server tag preparation (`server-vX.Y.Z`) from `project/apps/server/package.json`,
  - forced tag overwrite behavior for repeated pushes,
  - manual Colyseus deploy job gated to `server-v*` workflow ref and production environment deployment.
- Added explicit workflow checks for:
  - selected tag existence and package-version/tag alignment,
  - required deployment secrets (`COLYSEUS_CLOUD_APPLICATION_ID`, `COLYSEUS_CLOUD_TOKEN`).
- Added server deployment runbook and architecture cross-link for operator setup/usage.

## Delivered References
- `/.github/workflows/server-colyseus-deploy.yml`
- `/project/docs/server-colyseus-deployment.md`
- `/project/docs/architecture-overview.md`
