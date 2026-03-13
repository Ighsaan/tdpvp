# ADR-0002: Adopt ThreeJS as Primary Client Rendering Stack

## Status
Accepted

## Date
2026-03-13

## Decision Owners
- AI agent (Codex) with repository governance constraints

## Problem Statement and Context
The project started with a 2D Phaser presentation in `/project/apps/client`. As the lane-based PvP prototype matured, the team required a strategic 3D presentation that better communicates left-vs-right battlefield readability while preserving authoritative server architecture.

The client migration must not change simulation ownership boundaries:
- server remains authoritative,
- shared contracts remain stable,
- client remains intent + presentation only.

## Options Considered
1. Keep Phaser 2D as primary client and evolve visuals incrementally.
2. Keep Phaser primary and maintain a separate ThreeJS prototype client forever.
3. Migrate `/project/apps/client` to ThreeJS and keep optional alternates for experimentation.

## Decision
Choose option 3.

`/project/apps/client` becomes the primary ThreeJS client with:
- fixed strategic camera,
- 3D board-style battlefield rendering,
- authoritative state-driven base/tower/unit visuals,
- unchanged Colyseus/shared-contract command flow.

No server or shared-schema authority responsibilities move into the client.

## Consequences
### Positive
- Stronger tactical readability for lane pressure and base orientation.
- Cleaner long-term rendering foundation for 3D polish work.
- Preserves authoritative simulation boundaries and anti-cheat posture.

### Negative
- Added rendering complexity and dependency weight in client runtime.
- Additional performance and asset-pipeline work needed in later phases.

### Risks
- Rendering architecture could drift into client-side gameplay logic if not monitored.
- Scene complexity growth may cause performance regressions without pooling/culling work.

### Follow-Ups
- Add focused tasks for 3D unit/tower visual upgrades, placement preview, highlights, camera variants, and performance pooling.
- Keep documentation synchronized as rendering modules evolve.
