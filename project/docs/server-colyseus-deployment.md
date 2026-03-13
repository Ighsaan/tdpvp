# Server Deployment to Colyseus Cloud

## Purpose
Define the manual deployment workflow for `/project/apps/server` so client applications can connect to a remotely hosted authoritative server.

## Workflow File
- `/.github/workflows/server-colyseus-deploy.yml`

## Trigger Model
1. Manual deployment (`workflow_dispatch`):
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

3. Colyseus Cloud build settings (required for this monorepo):
- Root Directory: `project/apps/server`
- Build Command:
  - `npm ci --prefix ../../packages/shared && npm run build --prefix ../../packages/shared && npm ci && npm run build`
- Start Command:
  - `npm start`
- PM2 ecosystem file (required by Colyseus post-deploy):
  - `project/apps/server/ecosystem.config.cjs`
  - Must define a valid `script` entrypoint (`dist/index.js` in this project).

If Root Directory is not `project/apps/server`, deploy may fail with:
- `Could not read package.json: ... /home/deploy/source/package.json`
If ecosystem config is missing or misconfigured, deploy may fail with:
- `missing ecosystem config file. make sure to provide one with a valid "script" entrypoint file path.`

## Deployment Flow
1. Push the desired server changes to `main`.
2. Open GitHub Actions and run `Server Colyseus Deployment`.
3. In `Use workflow from`, choose `main`.
4. Run workflow (it always deploys to `production` environment).
5. Workflow builds shared/server packages and runs:
   - `colyseus-cloud deploy --applicationId ... --token ... --branch main --env ...`

## Rollback Guidance
- Re-run deployment after resetting `main` to a known-good commit, then deploy again.
- If using production environment protections, keep rollback deploy allowed for on-call/release maintainers.
