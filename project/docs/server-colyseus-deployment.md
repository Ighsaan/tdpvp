# Server Deployment to Colyseus Cloud

## Purpose
Define the release tag and manual deployment workflow for `/project/apps/server` so client applications can connect to a remotely hosted authoritative server.

## Workflow File
- `/.github/workflows/server-colyseus-deploy.yml`

## Trigger Model
1. Push to `main`:
- Reads version from `project/apps/server/package.json`.
- Force-updates release tag to `server-vX.Y.Z`.
- Existing tag with the same name is overwritten on each push.

2. Manual deployment (`workflow_dispatch`):
- Must be run from `main` branch selected via GitHub Actions `Use workflow from`.
- Verifies deploy prerequisites, then deploys `main` branch to Colyseus Cloud `production`.

## Required Repository Setup
1. GitHub environment secrets:
- Add `COLYSEUS_CLOUD_APPLICATION_ID` and `COLYSEUS_CLOUD_TOKEN` in GitHub Environment:
  - `production`
- `COLYSEUS_CLOUD_APPLICATION_ID` is the Colyseus Cloud application ID.
- `COLYSEUS_CLOUD_TOKEN` is a Colyseus Cloud personal token with deploy access.

2. Optional deployment approvals:
- Configure GitHub Environment protection rules (required reviewers/wait timers) for `production` to gate manual promotion.

## Deployment Flow
1. Bump server version in `project/apps/server/package.json` when needed.
2. Push to `main` (updates `server-vX.Y.Z` tag to latest main commit).
3. Open GitHub Actions and run `Server Colyseus Deployment`.
4. In `Use workflow from`, choose `main`.
5. Run workflow (it always deploys to `production` environment).
6. Workflow builds shared/server packages and runs:
   - `colyseus-cloud deploy --applicationId ... --token ... --branch main --env ...`

## Rollback Guidance
- Re-run deployment after resetting `main` to a known-good commit, then deploy again.
- If using production environment protections, keep rollback deploy allowed for on-call/release maintainers.
