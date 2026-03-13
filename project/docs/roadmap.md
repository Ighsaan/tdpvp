# Roadmap

## Roadmap Goals
Deliver a competitive, fair, and scalable realtime PvP experience in milestones that reduce risk early and preserve architectural integrity.

## Milestone 1: Foundations (Documentation + Contracts)
### Objectives
- Finalize core design docs, architecture boundaries, and schema drafts.
- Establish task workflow, ADR practice, and governance process.

### Exit Criteria
- Documentation scaffold complete and coherent.
- Authority model and simulation constraints fully documented.
- Initial task backlog for MVP defined.

## Milestone 2: MVP Core Gameplay
### Objectives
- Implement basic match loop with unit spawn, tower placement, and core abilities.
- Establish deterministic tick simulation and win condition resolution.
- Provide playable head-to-head prototype.

### Exit Criteria
- Complete end-to-end 1v1 match flow.
- Command validation, state sync, and match results functioning.
- Baseline telemetry and debug tooling available.

## Milestone 3: Multiplayer Stability
### Objectives
- Improve reconnect/resync handling.
- Harden anti-cheat validation and command abuse protections.
- Expand automated test coverage for deterministic behavior.

### Exit Criteria
- Stable matches under realistic latency/jitter conditions.
- Reliable reconnect behavior in defined grace window.
- Regression test suite for critical multiplayer paths.

## Milestone 4: Meta Systems and Progression
### Objectives
- Integrate Supabase-backed profiles, loadouts, inventory, and match history.
- Add ranking/leaderboard flows.
- Ensure secure and auditable result persistence pipeline.

### Exit Criteria
- Authenticated player progression loop functional.
- Match outcomes consistently persisted and queryable.
- Rank updates reflect authoritative results.

## Milestone 5: Scaling and Live Readiness
### Objectives
- Optimize server performance and room scaling strategy.
- Improve observability, operational dashboards, and incident playbooks.
- Prepare for broader test cohorts.

### Exit Criteria
- Capacity targets met for concurrent rooms.
- Monitoring/alerting for realtime health and desync indicators.
- Release readiness checklist passed.

## Ongoing Tracks
- Balance tuning and content iteration.
- UX polish and onboarding improvements.
- Security hardening and abuse response tuning.
