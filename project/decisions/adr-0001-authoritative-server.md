# ADR-0001: Authoritative Server Model

## Status
Accepted

## Date
2026-03-12

## Context / Problem
The game is a competitive realtime PvP experience where fairness and exploit resistance are core product requirements. A naive peer-authoritative or heavily client-trusting model would reduce infrastructure complexity but increases cheat vectors, desync risk, and inconsistent match outcomes across clients.

We need an architecture that:
- provides consistent outcomes under latency and packet loss,
- prevents clients from fabricating resource/combat outcomes,
- supports ranked integrity and trustworthy post-match persistence.

## Options Considered

## Option A: Client-Authoritative / Peer-Led Model
### Pros
- Lower server compute cost.
- Potentially simpler early prototype networking.

### Cons
- High cheat risk.
- Divergent outcomes across clients.
- Difficult ranked integrity and dispute resolution.

## Option B: Hybrid with Partial Client Authority
### Pros
- Better responsiveness for some systems.
- Lower server burden than full authority.

### Cons
- Complex trust boundary.
- Increased exploit surface in partially trusted domains.
- Harder reasoning about correctness and rollback.

## Option C: Fully Authoritative Server (Chosen)
### Pros
- Strong fairness and anti-cheat posture.
- Deterministic single source of truth.
- Reliable basis for ranked and progression updates.

### Cons
- Higher server complexity and operational cost.
- Requires robust prediction/reconciliation for client responsiveness.
- Greater upfront design discipline for contracts and simulation timing.

## Decision
Adopt a fully authoritative server architecture for all gameplay outcomes. Clients send intent only. The Colyseus server validates commands, runs deterministic tick simulation, and publishes authoritative state. Supabase persists identities and post-match meta outcomes but does not resolve live match logic.

## Consequences

## Positive
- Competitive integrity is materially improved.
- Clear separation of responsibilities across client/server/backend.
- Easier auditability for disputes and anti-cheat enforcement.

## Negative / Tradeoffs
- Increased implementation complexity in networking and reconciliation.
- More infrastructure investment for low-latency realtime servers.
- Strict schema and determinism discipline required.

## Follow-Up Requirements
- Maintain simulation and schema docs as first-class artifacts.
- Add deterministic testing and replay verification capabilities.
- Track latency and desync telemetry as operational priorities.
