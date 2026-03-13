# React UI Shell Flow

## Purpose
Describe the React-based frontend shell for non-battle product flow and its separation from ThreeJS gameplay rendering.

## Scope
This flow covers:
- onboarding,
- main menu,
- play menu,
- join match,
- settings,
- lobby,
- transition into active battle rendering.

## Architectural Split
### React UI Shell (`/project/apps/client/src/app`)
Responsible for:
- screen navigation,
- form validation,
- local profile persistence (username + onboarding flag),
- create/join/lobby UI interactions,
- host control UI affordances.

### Networking Layer (`/project/apps/client/src/network`)
Responsible for:
- lobby create/join API calls,
- Colyseus room join/leave,
- authoritative snapshot subscription,
- command sending abstraction for lobby and battle commands.

### Gameplay Renderer (`/project/apps/client/src/game`)
Responsible for:
- ThreeJS battle scene only,
- authoritative entity visualization,
- camera + battlefield rendering,
- mounted during active gameplay phase.

### Desktop Runtime Integration (`/project/apps/client/src/lib/desktop-update-service.ts`)
Responsible for:
- desktop-only startup updater check through Tauri updater APIs,
- prompting user before download/install,
- relaunching desktop app after install,
- surfacing non-fatal update errors in the React shell.

This integration is runtime-gated so web builds skip desktop updater logic.

## Screen Flow
1. `OnboardingScreen` if profile not onboarded.
2. `MainMenuScreen` after onboarding.
3. `PlayMenuScreen` from main menu.
4. `JoinMatchScreen` from play menu join action.
5. `SettingsScreen` from main menu settings action.
6. `LobbyScreen` after successful create/join.
7. `BattleRendererPanel` when authoritative room phase becomes `active`.

## Local Profile Handling
For this phase, local storage is authoritative only for profile convenience fields:
- `username`,
- `onboarded` flag.

Validation:
- username required,
- trimmed,
- min 2,
- max 20.

## Match Code Flow
- Match codes are server-generated and server-resolved.
- Format: exactly 5 chars, uppercase alphanumeric.
- React normalizes/validates for UX; server remains authoritative.

## Authoritative Lobby State
`BattleRoomSnapshot` now provides lobby-critical state:
- `matchCode`,
- `hostSessionId`,
- player usernames,
- lane count (`battlefield.laneCount`),
- current room phase.

React renders this state; it does not own truth.

## Host Permissions
Server validates host-only actions:
- update lobby lane count (2-6),
- start match.

Client hides/disables controls for non-host users for UX, but authority enforcement is server-side.

## Phase Transition Behavior
- Lobby phase is represented by existing pre-active room phases.
- On host start command, server transitions room to `active`.
- React detects `active` and mounts battle renderer.

## Non-Goals
- external auth/account systems,
- production profile persistence,
- advanced matchmaking,
- full post-match flow.

## Follow-Up Areas
- reconnect/resume into lobby,
- leave/cancel flow polish,
- richer error/recovery states,
- ready-state and transition polish,
- remote profile identity integration.
- richer desktop update UX (progress/details/release notes).
