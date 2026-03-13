# Architecture (AI Governance View)

## System Context
The game is a realtime PvP side-scrolling tower defence experience with two competing players in live matches. The architecture is intentionally split into three domains:
- `Client`: visual interaction and user experience.
- `Realtime Server`: authoritative match simulation and state authority.
- `Backend Platform`: persistent meta-progression and account services.

## Repository Implementation Mapping
- Client code lives in `/project/apps/client`.
- Realtime server code lives in `/project/apps/server`.
- Shared contracts for messages/state live in `/project/packages/shared`.
- Conceptual schema docs remain in `/project/schemas`.

## Client Architecture (TypeScript Render Clients)
### Responsibilities
- Render world, units, towers, effects, and UI.
- Capture player intent (spawn, place tower, cast ability).
- Display local prediction/interpolation for responsiveness.
- Reconcile local view against authoritative updates.
- Use React shell for non-battle product screens and forms.
- Mount ThreeJS gameplay renderer for active battle presentation.
- Optionally run inside a Tauri desktop shell for native packaging and updater delivery.

Current implementations:
- `/project/apps/client` (React UI shell + ThreeJS gameplay renderer)

### Non-Responsibilities
- No authoritative hit detection or damage resolution.
- No authoritative mana validation.
- No ownership of win/loss state decisions.
- No local desktop-only fallback that bypasses remote authoritative server simulation.

## Realtime Server Architecture (Colyseus + TypeScript)
### Core Responsibilities
- Own full authoritative match state.
- Validate all incoming player commands.
- Execute fixed-step simulation loop.
- Emit state snapshots/patches and events.
- Enforce anti-cheat and command legality.

### Internal Domains
- `Room Lifecycle`: create, join, start, simulate, end, dispose.
- `Command Pipeline`: receive -> validate -> queue -> execute.
- `Simulation Core`: deterministic systems update per tick.
- `Replication Layer`: publish relevant state changes to clients.
- `Match Results`: produce canonical outcome for persistence.

## Supabase Role
### Responsibilities
- Authentication and identity.
- Player profile and progression data.
- Deck/loadout, inventory, unlocks.
- Match history and rankings/leaderboards.
- Storage and asynchronous backend workflows.

### Boundary
Supabase does not determine live match simulation outcomes. It stores and serves persistent data before/after matches and supports non-realtime workflows.

## Colyseus Room Lifecycle
1. `Room Creation`: allocate room, initialize deterministic seed/config.
2. `Player Join`: authenticate, assign side/slot, sync initial state.
3. `Pre-Match`: readiness checks and countdown.
4. `Match Start`: lock baseline state and begin simulation ticks.
5. `Active Simulation`: process command queue each tick, update systems, broadcast state deltas.
6. `Match End`: evaluate win conditions, finalize authoritative results.
7. `Post-Match`: publish final results, persist via backend workflows.
8. `Room Dispose`: release resources and telemetry buffers.

## Networking Model
- Transport carries command intents from clients.
- Server validates and executes intents in deterministic order.
- Clients receive authoritative state updates and event streams.
- Clients smooth presentation locally without changing server truth.

## State Synchronization Strategy
- Fixed tick simulation produces deterministic state transitions.
- Server sends compressed state diffs/snapshots at configured intervals.
- Clients maintain interpolation buffers for render-time smoothing.
- Reconciliation corrects predicted client visuals to server state safely.
- Rejoin/reconnect requires authoritative state snapshot + replay-safe resync.

## Anti-Cheat Strategy
- Validate command ownership, timing, cooldowns, resources, and positional constraints.
- Reject impossible command frequency and malformed payloads.
- Record suspicious patterns for moderation and tuning.
- Never trust client-reported combat outcomes.

## Design Constraints
- Determinism and authority have higher priority than visual smoothness.
- Latency mitigation must not bypass validation.
- Contract stability is required across `/project/schemas` and server/client implementations.
