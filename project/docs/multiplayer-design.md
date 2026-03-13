# Multiplayer Design

## Matchmaking
- Primary mode is 1v1 competitive PvP.
- Matchmaking should prioritize:
  - acceptable latency region,
  - fair skill rating ranges,
  - queue time constraints.
- Initial implementation may use simple rating buckets, with iterative tuning as data grows.

## Room Lifecycle
1. Matchmaker allocates or selects a room.
2. Both players join and complete readiness checks.
3. Room enters countdown and then active simulation.
4. Server tracks disconnect/reconnect windows.
5. Match ends on authoritative win condition.
6. Final result is persisted and room is disposed.

## Reconnection Strategy
- Short reconnect grace window to rejoin active match.
- Rejoining client receives current authoritative snapshot and required metadata.
- Missed visuals are reconstructed from current state, not from trusted client history.
- If reconnect fails beyond grace policy, match resolution follows abandonment rules.

## Spectator Design (Planned)
- Read-only subscription to authoritative state stream.
- Spectators cannot influence gameplay state.
- Delay options can be applied to reduce stream-sniping risk.
- Spectator bandwidth profile should be decoupled from player replication profile.

## Replay Possibilities (Planned)
- Server-side event/tick log can support deterministic replay reconstruction.
- MVP may start with summary replay data, then evolve toward full playback fidelity.
- Replay integrity depends on stable schemas and deterministic simulation consistency.

## Competitive Integrity Policies
- Server-side command validation and anti-cheat monitoring.
- Clear abandonment and disconnect handling rules.
- Prevent exploit paths through strict ownership and timing checks.

## Observability Requirements
- Log key lifecycle events (join, ready, start, disconnect, reconnect, end).
- Capture authoritative outcomes and suspicious command rejection patterns.
- Track latency and desync indicators for operational tuning.
