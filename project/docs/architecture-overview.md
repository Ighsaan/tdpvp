# Architecture Overview

## High-Level Topology
The project consists of three collaborating systems:
- `Client Applications (TypeScript)`: render gameplay and capture player intent.
- `Realtime Server (Colyseus + TypeScript)`: runs authoritative match simulation.
- `Backend Platform (Supabase)`: manages authentication and persistent progression data.

## Repository Implementation Mapping (Current)
- Primary ThreeJS client implementation: `/project/apps/client`
- Realtime server implementation: `/project/apps/server`
- Shared client/server contracts: `/project/packages/shared`
- Client desktop packaging and updater flow: `/project/docs/client-desktop-packaging-and-updates.md`
- Server deployment runbook: `/project/docs/server-colyseus-deployment.md`
- Implementation scaffold details: `/project/docs/implementation-foundation.md`
- ThreeJS client rendering details: `/project/docs/client-3d-rendering.md`
- React UI shell flow details: `/project/docs/react-ui-shell-flow.md`

## Responsibility Split
### Client Applications
- React shell handles onboarding/menu/settings/lobby UI.
- ThreeJS layer handles active battle rendering.
- Reconciliation to authoritative state updates.
- Tauri desktop shell packages `/project/apps/client` for native distribution and updater integration.
- Renderer stack is implementation-specific, but command and authority boundaries remain identical.

### Realtime Server
- Match room lifecycle and player session control.
- Command validation and anti-cheat enforcement.
- Deterministic simulation and win condition resolution.
- State synchronization to connected clients.

### Supabase
- Authentication/session identity.
- Player profile, deck/loadout, inventory, progression.
- Match history and ranking/leaderboard data.
- Supporting asynchronous backend workflows.

## Data Flow
1. Player authenticates through backend services.
2. Matchmaking selects opponent and provisions/joins room.
3. Client sends gameplay commands (intent only).
4. Server validates and executes commands inside tick-based simulation.
5. Server broadcasts authoritative state updates/events.
6. Client renders resulting state and handles visual smoothing.
7. Match result is persisted to backend after authoritative finalization.

## Architectural Priorities
- Fairness and anti-cheat resilience.
- Deterministic simulation behavior.
- Stable network/state contracts.
- Clear domain boundaries that scale with team size and feature count.

## Current Simulation Contract
- Lane-based 1D deterministic simulation (6 lanes default).
- Server-authoritative tower placement and removal.
- Towers spawn units automatically using server-owned definitions.
- Units move and fight in-lane, then damage enemy base on reach.
- Match ends when one base reaches 0 HP.

## Failure and Recovery Considerations
- Reconnection path must restore authoritative state.
- Command deduplication and sequence validation prevent replay abuse.
- Backend outages should not compromise live match authority; persistence retries happen post-match.
