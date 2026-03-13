# Player State Schema

## Purpose
Define authoritative per-player state tracked during a match and replicated to clients as needed.

## Runtime Mapping
- Current scaffold player state interfaces are implemented in `/project/packages/shared/src/schemas/battle-room-state.ts`.

## Identity and Session Fields
- `playerId`: canonical player identity.
- `sessionId`: active match session handle.
- `username`: player-facing display name synchronized in room state.
- `slot/side`: assigned side in match (left/right, player1/player2).
- `connectionState`: connected, reconnecting, disconnected.

## Gameplay Resource Fields
- Resource/economy fields are intentionally deferred in the current MVP contract.
- Tower cost/economy validation is currently placeholder-only server logic.

## Tactical State Fields
- Side assignment (`left` or `right`).
- Ready status for match start.
- Connected/reconnecting status.
- Runtime ownership counts (`towerCount`, `unitCount`).
- Host status is derived from room-level `hostSessionId`.

## Runtime Collections
- Current contract exposes derived ownership counts instead of full entity id lists.
- Typed command rejection feedback remains available through network events.

## Match Outcome Fields
- Winning side is tracked at room state level.
- Extended per-player result stats are deferred to later progression/persistence phases.

## Privacy and Replication Considerations
- Public opponent data should exclude hidden/private tactical details if fog-of-war or concealed info is introduced.
- Sensitive backend profile fields must never be included in realtime player state payloads.
- Replication granularity should balance fairness, clarity, and bandwidth.

## Validation Rules
- Player-owned action commands can only mutate that player's legal state scopes.
- Server rejects commands attempting to alter opponent-owned resources directly unless defined by gameplay rules.
- Player state mutations are applied only through deterministic simulation systems.

## Versioning and Compatibility
- Player state schema changes require coordinated updates to:
  - network messages,
  - match state schema,
  - relevant client rendering/UX assumptions,
  - and documentation references.
