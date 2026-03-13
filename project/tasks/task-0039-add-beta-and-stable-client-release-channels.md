# Title
Add Beta and Stable Desktop Client Release Channels

## Status
Backlog

## Description
Desktop updater currently follows a single release track from GitHub Releases latest metadata.

## Goal
Introduce explicit beta/stable release channel support without affecting server authority boundaries.

## Acceptance Criteria
- Separate updater metadata endpoints/channels exist for beta and stable clients.
- Build/release workflow can publish to either channel intentionally.
- Channel selection approach is documented for developers.

## Technical Notes
- Keep updater signing requirements identical across channels.
- Preserve deterministic multiplayer behavior regardless of client channel.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`

## Validation Plan
- Verify beta client does not auto-consume stable-only updates when channel-gated.
- Verify stable client ignores beta-only releases.
