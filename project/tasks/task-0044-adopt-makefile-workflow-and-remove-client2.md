# Title
Adopt Makefile Workflow and Remove Deprecated Alternate Client App

## Status
Done

## Description
The monorepo relied on npm scripts for orchestration and still contained a deprecated alternate client app that is no longer needed.

## Goal
Introduce a root Makefile for primary development/build commands, remove the deprecated alternate client app, and clean repository references to the removed app.

## Acceptance Criteria
- `/project/Makefile` provides install/dev/build/typecheck targets for shared, server, and client flows.
- Desktop client make targets include a clear Rust/Cargo prerequisite check.
- Deprecated alternate client app folder is removed from `/project/apps`.
- Governance and project docs no longer reference the removed alternate client app.
- Root scripts no longer include removed alternate client workflow references.

## Technical Notes
- Keep server-authoritative multiplayer boundaries unchanged.
- Keep desktop packaging scope client-only.

## Dependencies
- `/project/tasks/task-0037-set-up-client-tauri-packaging-and-github-release-updates.md`

## Docs to Update
- `/project/README.md`
- `/project/docs/implementation-foundation.md`
- `/project/docs/architecture-overview.md`
- `/project/docs/client-desktop-packaging-and-updates.md`
- `/ai/architecture.md`
- `/ai/repository-rules.md`
- `/AGENTS.md`

## Validation Plan
- Run make targets for shared build and typechecks.
- Confirm no remaining repository references to the removed alternate client app.

## Validation Notes
- `make build-shared -C project`
- `make typecheck -C project`
- `make dev-client-desktop -C project` now fails fast with explicit Cargo install guidance when Rust is missing.

## Delivered References
- `/project/Makefile`
- `/project/package.json`
- `/project/README.md`
- `/project/docs/implementation-foundation.md`
- `/project/docs/architecture-overview.md`
- `/project/docs/client-desktop-packaging-and-updates.md`
- `/ai/architecture.md`
- `/ai/repository-rules.md`
- `/AGENTS.md`
