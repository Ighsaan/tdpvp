# Title
Set Up Client Tauri Packaging and GitHub Releases Auto-Updates

## Status
Done

## Description
The primary React + ThreeJS client currently runs as a web application only. We need a client-only desktop packaging flow that preserves existing multiplayer authority boundaries while enabling native desktop distribution and update delivery.

## Goal
Wrap `/project/apps/client` in a Tauri desktop shell and deliver signed updater artifacts through GitHub Releases so installed desktop clients can detect and install new versions.

## Acceptance Criteria
- `/project/apps/client` supports Tauri desktop development and desktop build commands.
- Tauri updater is configured for GitHub Releases and is isolated to desktop runtime concerns.
- Client startup includes a desktop update check with clear paths for no-update, accept install, defer, and error.
- GitHub Actions workflow(s) build and publish client desktop artifacts with updater metadata/signatures.
- Documentation explains setup, required secrets, versioning, and release/update test flow.
- No server deployment workflow is introduced in this phase.

## Technical Notes
- Preserve existing client architecture responsibilities (React UI shell + ThreeJS battle rendering + Colyseus networking).
- Desktop shell remains a presentation/client runtime only; authoritative gameplay stays server-side.
- Keep desktop-specific code behind a single abstraction to avoid web runtime breakage.

## Dependencies
- `/ai/architecture.md`
- `/project/docs/architecture-overview.md`
- `/project/docs/react-ui-shell-flow.md`
- `/project/tasks/README.md`

## Docs to Update
- `/project/docs/architecture-overview.md`
- `/project/docs/react-ui-shell-flow.md`
- `/project/README.md`
- `/project/docs/client-desktop-packaging-and-updates.md` (new)

## Validation Plan
- Typecheck and build shared + client web flow.
- Build Tauri desktop artifacts locally (or at minimum compile path validation).
- Validate update check behavior in desktop runtime and no-op behavior in web runtime.

## Assumptions
- Release artifacts are published to GitHub Releases for this repository.
- Signing keys and optional platform certificates are injected through GitHub secrets/variables.

## Validation Notes
- `npm run typecheck --prefix project/packages/shared`
- `npm run typecheck --prefix project/apps/client`
- `npm run build --prefix project/apps/client`
- `npm run build:shared --prefix project/apps/client`
- `npm run tauri:build:ci --prefix project/apps/client` currently fails in this environment because `cargo` is not installed locally.

## Delivered References
- `/project/apps/client/src-tauri/tauri.conf.json`
- `/project/apps/client/src-tauri/Cargo.toml`
- `/project/apps/client/src-tauri/src/main.rs`
- `/project/apps/client/src-tauri/capabilities/default.json`
- `/project/apps/client/src/lib/desktop-update-service.ts`
- `/project/apps/client/src/app/app-shell.tsx`
- `/.github/workflows/client-desktop-release.yml`
- `/project/docs/client-desktop-packaging-and-updates.md`
- `/project/tasks/task-0038-add-server-deployment-workflow.md`
- `/project/tasks/task-0039-add-beta-and-stable-client-release-channels.md`
- `/project/tasks/task-0040-improve-desktop-update-progress-ui.md`
- `/project/tasks/task-0041-complete-platform-code-signing-hardening.md`
- `/project/tasks/task-0042-surface-desktop-release-notes-in-app.md`
- `/project/tasks/task-0043-design-staged-rollout-strategy-for-desktop-updates.md`
