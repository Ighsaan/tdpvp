# Networking Model

## Core Principle
The game uses an authoritative server model. Clients submit intent; the server validates and applies state transitions. All gameplay outcomes are server-authored.

## Client Intent Model
- Clients send command messages (ready, place tower, remove tower, diagnostics ping).
- Clients also send lobby commands (update lane count, start match) through the same authoritative command channel.
- Commands contain identity/session context, intent payload, and sequencing metadata.
- Clients may predict visuals for responsiveness but cannot finalize outcomes.
- Runtime command contracts are defined in `/project/packages/shared`.
- Client 3D rendering consumes authoritative snapshots as presentation only; visual state must never become gameplay truth.

## Lobby/Create/Join Flow
- React shell initiates create/join via server HTTP endpoints:
  - `POST /lobby/create`
  - `POST /lobby/join`
- Server resolves/owns match code and room lookup.
- Client joins authoritative room by returned `roomId`.
- Lobby state is synchronized via the same authoritative room snapshot stream.
- Host-only actions remain validated server-side.

## Authoritative Command Processing
1. Receive command.
2. Validate ownership, timing, cooldowns, resources, and legal targets/zones.
3. Queue accepted commands for deterministic tick execution.
4. Reject invalid commands with optional reason codes.
5. Emit authoritative events/state updates after simulation step.

## Server Tick Loop
- Fixed-step simulation tick (target frequency defined in `/project/simulation/tick-model.md`).
- Each tick executes:
  - command application for the tick window,
  - tower spawning updates,
  - unit movement and combat resolution,
  - base interaction and win checks,
  - win condition evaluation,
  - replication output generation.

## Synchronization Strategy
- Periodic snapshots and/or deltas from server to clients.
- Sequence numbers/tick ids for ordering and reconciliation.
- Client interpolation buffers for smooth rendering under jitter.
- State corrections applied from authoritative data with visual smoothing.
- Current scaffold uses periodic authoritative snapshot events to validate end-to-end flow.

## Reliability and Ordering
- Commands include sequence ids to detect duplicates/out-of-order delivery.
- Server processes commands by deterministic ordering rules when simultaneous.
- Critical lifecycle events (match start/end, reconnect state) require explicit acknowledgements.

## Latency Handling
- Input buffering and local prediction for perceived responsiveness.
- Server remains final source of truth for all combat/resource events.
- Reconciliation minimizes harsh visual snapping while preserving correctness.

## Security Considerations
- Reject malformed and impossible-frequency command streams.
- Rate-limit abusive command patterns.
- Never accept client-reported damage, resource deduction, or objective state.
- Unit spawning remains server-owned through tower automation; clients do not directly spawn units.
