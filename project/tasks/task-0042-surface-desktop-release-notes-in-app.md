# Title
Surface Desktop Release Notes In-App

## Status
Backlog

## Description
Users can install updates, but release context is not currently shown in the desktop UI.

## Goal
Display concise release notes when an update is available and/or after successful update install.

## Acceptance Criteria
- Update prompt can show release notes metadata from the release feed.
- Notes render safely and do not block install flow.
- Missing notes are handled gracefully.

## Technical Notes
- Keep implementation presentation-only on client.
- Preserve simple fallback path when metadata is unavailable.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`

## Docs to Update
- `/project/docs/client-desktop-packaging-and-updates.md`
- `/project/docs/react-ui-shell-flow.md`

## Validation Plan
- Verify notes appear for releases with metadata.
- Verify empty/invalid notes do not break update prompt.
