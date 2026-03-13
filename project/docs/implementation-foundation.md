# Implementation Foundation (Phase 2B)

## Purpose
Document the first real authoritative simulation contract for the lane-based PvP tower defence MVP.

## Scope Delivered
- Multi-package TypeScript scaffold under `/project` with:
  - `/project/apps/client`
  - `/project/apps/server`
  - `/project/packages/shared`
- Shared TypeScript base configuration and strict typing defaults.
- Shared network/state contracts consumed by both client and server.
- Colyseus `BattleRoom` with deterministic simulation pipeline and server authority over gameplay outcomes.
- Authoritative lobby/create/join flow with server-owned match code and host controls.
- Lane-based battlefield model with tower placement zones and neutral no-build zone.
- Two spawner tower types that automatically spawn units.
- Unit movement, lane-locked engagement, base damage, and authoritative win condition.
- ThreeJS client rendering for lanes, bases, towers, units, and placement zones with a fixed strategic camera.

## Repository Layout
```text
/project
  package.json
  tsconfig.base.json
  /apps
    /client
    /server
  /packages
    /shared
  /docs
  /systems
  /simulation
  /schemas
  /decisions
  /tasks
```

## Shared Contracts
Source: `/project/packages/shared/src`

Current shared contract coverage:
- `BattleRoomState`, `BattlefieldState`, `LaneState`, `BaseState`, `TowerState`, `UnitState`, `PlayerState`.
- `RoomPhase`, `PlayerSide`, `TowerType`, `TowerStateStatus`, `UnitType`, `UnitStateStatus`.
- `PlayerCommand` union:
  - `player.ready`
  - `player.ping`
  - `player.place_tower`
  - `player.remove_tower`
- `BattleRoomSnapshot` alias to the authoritative `BattleRoomState`.
- Message names/constants for command and server event channels.
- Runtime command validators for safe payload parsing.

## Server Foundation
Source: `/project/apps/server/src`

Core components:
- `index.ts`: Colyseus server bootstrap and room registration.
- `rooms/BattleRoom.ts`: authoritative room with:
  - join/leave/reconnect handling,
  - deterministic fixed tick loop,
  - command queue and ordered processing,
  - server-side command validation/rejections for tower placement and removal,
  - phase transitions (`waiting_for_players -> preparing -> active -> ended`),
  - authoritative snapshot broadcasts.
- `commands/command-queue.ts`: deterministic command ordering.
- `state/battle-room-state.ts`: mutable authoritative runtime state + snapshot conversion.
- `data/game-definitions.ts`: data-driven tower and unit definitions.
- `simulation/simulation-pipeline.ts`: deterministic simulation steps:
  - `processTowerSpawning`
  - `processUnitMovement`
  - `processUnitCombat`
  - `processBaseInteractions`
  - `removeDestroyedEntities`
  - `checkWinCondition`

## Client Foundation
Sources:
- `/project/apps/client/src`

Primary ThreeJS client (`/project/apps/client`) core components:
- React app shell for onboarding/menu/settings/play/join/lobby flow.
- ThreeJS scene foundation with renderer, scene, fixed gameplay camera, lighting, resize handling, and lifecycle cleanup.
- Dedicated battlefield rendering for lanes, placement/neutral zones, and bases.
- Authoritative state-driven entity visualization for towers and units.
- Networking abstraction around Colyseus with the same authoritative command flow.
- Developer HUD/debug panel for connection, phase, side, base HP, and entity counts.

Client rendering architecture details:
- `/project/docs/client-3d-rendering.md`
- `/project/docs/react-ui-shell-flow.md`

Client controls in current scaffold:
- `R`: toggle ready command.
- `P`: send ping command.
- `A / D`: change selected lane.
- `1`: place `basic_spawner` in selected lane.
- `2`: place `fast_spawner` in selected lane.
- `X`: remove latest owned tower in selected lane.

## Vertical Slice Behavior
Current vertical slice validates:
1. Client connects to Colyseus server.
2. Client joins or creates `battle_room`.
3. Server registers player in authoritative state.
4. React shell drives create/join/lobby flow and sends intent commands.
5. Host updates lane count and starts match through authoritative server validation.
6. Server validates commands and mutates room state on deterministic ticks.
7. Towers spawn units automatically from server-side definitions.
8. Units move in-lane, engage enemies in-range, and damage enemy base on reach.
9. Server resolves match end when a base reaches 0 HP.
10. Client receives snapshots and renders authoritative simulation state.

## Simulation Model (Implemented)
- Canonical orientation is left-vs-right across all lanes.
- Battlefield defaults:
  - lane count: `6`
  - lane length: `100`
  - base HP: `100` per side
- Placement zones:
  - left zone only for left player
  - right zone only for right player
  - neutral middle no-build zone
- Units are lane-locked and do not switch lanes.
- Players do not directly spawn units; towers spawn units over time.

## Run Instructions
Run from `/project`:

1. Install dependencies:
   - `make install-all`
2. Start server:
   - `make dev-server`
3. Start primary ThreeJS client (new terminal):
   - `make dev-client`
4. Open browser:
   - `http://localhost:5173` (primary ThreeJS client)

Server default websocket endpoint: `ws://localhost:2567`  
Override from client with `VITE_SERVER_URL` if needed.

## Deferred to Later Phases
This foundation intentionally does not include:
- full economy and tower purchase flow,
- advanced combat mechanics/projectiles/status effects,
- matchmaking queues,
- Supabase auth/persistence integration,
- ranking/progression systems,
- production UI/UX polish and perspective flipping.

## Notes on Authority
- Client sends intent only.
- Server controls phase transitions, tower placement validation, spawning, movement, combat, base damage, and win resolution.
- Shared contracts define transport/state boundaries; server remains source of truth for gameplay outcomes.
