# Title
Complete Platform Code Signing Hardening

## Status
Backlog

## Description
Updater artifact signing is scaffolded, but platform trust requirements (notarization/certificate chains) still need environment-specific completion.

## Goal
Finalize macOS and Windows signing/notarization integration for production-grade desktop distribution.

## Acceptance Criteria
- macOS signing/notarization is automated in CI for release builds.
- Windows code-signing is automated in CI for release builds.
- Secret rotation and certificate management process is documented.

## Technical Notes
- Do not commit private keys or certificates.
- Keep release pipeline client-only.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`
- security/signing runbook doc to be added in `/project/docs`

## Validation Plan
- Verify signed artifacts pass OS trust checks on clean machines.
- Verify updater can apply signed patch update end-to-end.
