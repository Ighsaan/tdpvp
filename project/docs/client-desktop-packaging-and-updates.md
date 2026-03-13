# Client Desktop Packaging and Auto-Updates

## Purpose
Define how `/project/apps/client` is packaged as a desktop app with Tauri and how updates are delivered through GitHub Releases.

## Scope
This document is client-only.

Included:
- Tauri desktop shell setup for `/project/apps/client`.
- GitHub Releases updater configuration.
- Startup update-check and install UX.
- GitHub Actions workflow for desktop artifact publishing.
- Versioning and release process for client desktop builds.

Not included:
- Realtime server deployment workflow.
- Any change to authoritative multiplayer ownership.
- Any offline/server-embedded desktop mode.

## Architecture Boundary
- React shell remains the product/menu UX.
- ThreeJS remains the battle rendering layer.
- Colyseus remains the multiplayer transport layer.
- Tauri is only the native desktop shell and updater host.
- Desktop packaging does not move gameplay authority from server to client.

## Client Integration Layout
Client desktop artifacts and config live with the client app:
- `/project/apps/client/src-tauri`: Rust runner + Tauri config + capabilities.
- `/project/apps/client/src/lib/desktop-update-service.ts`: desktop-only updater abstraction.
- `/project/apps/client/src/app/app-shell.tsx`: startup trigger for update check flow.

## Local Commands
Run from `/project`:
- `make dev-client-desktop`: desktop development shell around the Vite app.
- `make build-client-desktop`: local desktop build (uses configured Tauri bundling targets).

Web flow remains available:
- `make dev-client`
- `make build`

If Rust is not installed, `make dev-client-desktop` and `make build-client-desktop` fail with an explicit install hint for `cargo`.

## Updater Source
Updater endpoint uses GitHub Releases:
- `https://github.com/Ighsaan/tdpvp/releases/latest/download/latest.json`

The endpoint is consumed by the Tauri updater plugin configuration in:
- `/project/apps/client/src-tauri/tauri.conf.json`

Updater signatures are verified with the configured public key (`TAURI_UPDATER_PUBLIC_KEY`).

## Desktop Update UX
On desktop startup:
1. App checks for update via Tauri updater API.
2. If no update is available, app continues normally.
3. If update exists, app prompts user to install immediately.
4. If accepted, app downloads and installs update, then relaunches.
5. If check/install fails, app shows a clear non-fatal error banner.

Web runtime behavior:
- Updater flow is skipped by runtime gating.

## GitHub Actions Release Workflow
Workflow file:
- `/.github/workflows/client-desktop-release.yml`

Note: GitHub Actions requires workflow files under repository-root `/.github/workflows`.

Responsibilities:
- install shared/client dependencies,
- build shared package,
- build desktop artifacts (macOS, Linux, Windows matrix),
- publish artifacts to GitHub Releases,
- publish updater metadata used by desktop clients.

Trigger:
- `prepare-release-tag` job runs on push to `main` only.
- `release-client-desktop` job runs on manual `workflow_dispatch` only.
- manual release must be started from a `client-v*` tag selected in GitHub Actions `Use workflow from`.
- tag preparation derives version from `/project/apps/client/src-tauri/Cargo.toml`.
- push flow creates release tag (`client-vX.Y.Z`) only when it does not already exist.
- if the tag already exists at a different commit, push flow fails and requires a version bump before retrying.

## Required GitHub Secrets and Variables
Required for updater artifact signing and release publishing:
- `TAURI_SIGNING_PRIVATE_KEY` (secret)
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (secret; empty string if key has no password)
- `TAURI_UPDATER_PUBLIC_KEY` (secret injected into `tauri.conf.json` during release workflow before build)

Release publishing token:
- built-in `GITHUB_TOKEN` (workflow permission `contents: write`).

Optional platform-signing secrets (for production trust polish):
- macOS notarization/certificate secrets.
- Windows code-signing certificate secrets.

## Versioning and Release Flow
Desktop updater version should align with client package and Tauri app version.

Recommended patch release flow:
1. Bump client version in `/project/apps/client/src-tauri/Cargo.toml`, `/project/apps/client/package.json`, and `/project/apps/client/src-tauri/tauri.conf.json`.
2. Commit version bump and related changelog/docs updates.
3. Push to `main` to run tag preparation.
4. Tag preparation creates `client-vX.Y.Z` from `project/apps/client/src-tauri/Cargo.toml` if the tag does not already exist.
5. Run the `Client Desktop Release` workflow manually and choose `client-vX.Y.Z` in `Use workflow from`.
6. GitHub Actions publishes desktop artifacts + updater metadata to the GitHub Release.
7. Installed desktop clients detect and install the newer version on next startup check.

## Safe Update Testing Strategy
Use a two-release smoke test:
1. Publish baseline desktop release (for example `client-v0.1.0`) and install it.
2. Publish patch release (for example `client-v0.1.1`) with a visible app change.
3. Launch baseline app build and verify update prompt appears.
4. Accept install and verify app relaunches into new version.
5. Verify web runtime still works with no updater errors.

## Rollback Guidance
If a bad release is published:
- publish a higher patch version with the fix (preferred), or
- remove problematic release assets and republish corrected artifacts with a new version.

Do not reuse an existing released version number for updater flows.
