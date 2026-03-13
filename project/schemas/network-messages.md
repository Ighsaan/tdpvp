# Network Message Schemas

## Purpose
Define canonical client-server message contracts for realtime gameplay. These schemas are authoritative references for future implementation.

## Runtime Mapping
- Executable message contract types for the current scaffold live in:
  - `/project/packages/shared/src/commands`
  - `/project/packages/shared/src/schemas`
- This document remains the high-level contract intent reference.

## Design Principles
- Messages represent intent or authoritative outcomes, never client-authored state truth.
- All gameplay-relevant messages include versioning and sequence metadata.
- Validation is server-side and strict by default.

## Envelope Conventions
Every message should include:
- `schemaVersion`: contract version identifier.
- `messageType`: command/event/snapshot category.
- `matchId`: authoritative room/match identifier.
- `playerId` or actor identity where relevant.
- `clientSeq` and/or `serverTick` depending on direction.

## Client -> Server Command Messages
### `UpdateLobbyLaneCountCommand`
- Intent: host updates authoritative lobby lane count.
- Key fields: lane count.
- Server checks: host permission, phase legality, allowed range (`2..6`).

### `StartMatchCommand`
- Intent: host starts match from lobby.
- Key fields: none.
- Server checks: host permission, phase legality, required connected player count.

### `PlaceTowerCommand`
- Intent: request tower placement.
- Key fields: tower type, lane index, lane position, optional `clientSeq`.
- Server checks: ownership, phase legality, lane validity, placement-zone legality, tower type validity.

### `RemoveTowerCommand`
- Intent: request removal of an owned tower.
- Key fields: tower id, optional `clientSeq`.
- Server checks: ownership, phase legality, tower existence.

### `PingCommand`
- Intent: diagnostics heartbeat / latency check.
- Key fields: nonce and client timestamp.

### `ClientReadyState`
- Intent: pre-match readiness or sync acknowledgement.
- Key fields: readiness status, session metadata.

## HTTP Lobby Endpoints (UI Shell Integration)
### `POST /lobby/create`
- Intent: create authoritative lobby and allocate shareable match code.
- Request fields: username, optional lane count.
- Response fields: room id, match code, initial lane count.
- Server checks: username validity, lane-count bounds, code uniqueness.

### `POST /lobby/join`
- Intent: resolve match code to authoritative room id.
- Request fields: match code.
- Response fields: room id, normalized match code.
- Server checks: code format, lobby existence, available seat capacity.

## Server -> Client Authoritative Messages
### `StateSnapshot`
- Full/partial authoritative state for sync/reconnect.
- Includes server tick and deterministic context metadata.

### `StateDelta`
- Incremental state updates between snapshots.
- Contains changed entities/fields and tick range metadata.

### `GameplayEvent`
- Discrete events (tower placed/removed, unit spawned/destroyed, base damaged, match end).
- Includes event id, event type, actor/target references, tick id.
- Lobby-oriented events include lane-count updates and host-initiated match start notices.

### `CommandRejected`
- Rejection feedback for invalid client command.
- Includes reason code and rejected `clientSeq`.
- Current reasons include host-permission and lane-count validation failures for lobby commands.

## Lifecycle Messages
- `MatchStart`
- `MatchEnd`
- `PlayerReconnected`
- `DesyncRecovery` (if explicit recovery path is used)

## Validation and Compatibility Rules
- Unknown required fields: reject.
- Unknown optional fields: ignore until supported policy changes.
- Breaking contract changes require schema version bump and migration notes.
- Contract updates must be reflected in `/project/docs/networking-model.md`.
