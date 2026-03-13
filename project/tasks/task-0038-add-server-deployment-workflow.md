# Title
Add Server Deployment GitHub Actions Workflow

## Status
Backlog

## Description
The current desktop release flow is intentionally client-only. The authoritative Colyseus server still needs a separate deployment pipeline.

## Goal
Create a dedicated server build/deploy workflow with environment-specific rollout controls and rollback support.

## Acceptance Criteria
- Server workflow is isolated from client desktop release workflow.
- Deployment supports at least one non-production environment before production promotion.
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
- Verify deployment in staging.
- Confirm room lifecycle and simulation startup health checks pass.
