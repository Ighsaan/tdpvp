# Game State Schema

## Purpose
Define the authoritative match-level state model used by server simulation and replication.

## Runtime Mapping
- Current scaffold runtime snapshot interfaces are implemented in `/project/packages/shared/src/schemas/battle-room-state.ts`.

## Root State Shape (Conceptual)
- `match`: identifiers, lifecycle phase, winner metadata.
- `simulation`: authoritative tick counter and countdown metadata.
- `players`: per-player authoritative state objects.
- `battlefield`: lane model, bases, placement zones.
- `events`: buffered recent authoritative events for replication/debug.

## Match Metadata
- Match id, room id, region/mode, status (`waiting`, `countdown`, `active`, `ended`).
- Shareable `matchCode` for lobby join flow.
- `hostSessionId` for authoritative host permissions.
- Start/end tick markers.
- Result summary when finalized.

## Simulation Metadata
- Current tick id.
- Tick rate configuration reference.
- Deterministic seed/reference data.
- Phase flags (early/mid/late, overtime, sudden-death if used).

## Implemented Entity Model (MVP Contract)
### `TowerState`
- stable `towerId`
- owner session and side
- lane index and lane position
- `towerType` and `status`
- spawn interval/progress tracking
- spawned unit type

### `UnitState`
- stable `unitId`
- owner session and side
- lane index and lane position (1D scalar)
- combat stats and cooldown state
- current target reference (nullable)
- alive/destroyed status

## Battlefield / Lane Model
- Battlefield defaults to 6 lanes with canonical left-to-right orientation.
- Lobby host may configure lane count in authoritative bounds (`2..6`) before match start.
- Each lane is independent and stores towers/units for that lane.
- Placement zones are side-specific with a neutral middle no-build zone.
- Bases are side-owned and hold authoritative HP.

## Match Result Model
- Winner side (`left`/`right`) or `null` for draw.
- End reason derived from base destruction in current MVP contract.
- Persistence-facing summaries are deferred to later phases.

## Schema Rules
- State must be serializable for snapshots and reconnect.
- Field naming should be stable and explicit.
- Derived/transient fields should be minimized in replicated payloads.
- Any state field affecting gameplay must be server-authored.

## Versioning
- Include schema version marker in snapshot payloads.
- Document migration strategy for breaking state shape changes.
