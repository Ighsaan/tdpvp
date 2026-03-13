# Tick Model

## Purpose
Define timing semantics for deterministic simulation and synchronized replication.

## Tick Fundamentals
- Simulation advances in fixed-duration ticks.
- Tick id (`tick`) is the canonical simulation time reference.
- Gameplay durations are represented in ticks, not client wall-clock time.

## Target Frequencies
- Current MVP simulation tick rate: **10 ticks per second**.
- Rationale:
  - sufficient granularity for lane-based movement/combat in early MVP,
  - lower operational overhead while systems are still evolving,
  - deterministic debugging is easier at lower tick density.
- Tick rate may be raised in later phases after profiling and feel validation.
- Frequency changes must be documented and validated for balance impact.

## Timing Conventions
- Cooldowns: stored and reduced in ticks.
- Status effects: start tick + duration ticks.
- Spawn/build times: represented in tick offsets.
- Match timer: derived from tick progression.

## Input Windowing
- Commands include client sequence metadata and optional client timestamp for diagnostics.
- Server maps commands into accepted execution tick windows.
- Deterministic tie-breakers resolve simultaneous commands.

## Replication Cadence
- State replication may occur every tick or at configured intervals.
- Replication cadence must not alter simulation correctness.
- Clients interpolate between authoritative updates for rendering smoothness.

## Drift and Stability Controls
- Use monotonic server clock to schedule tick execution.
- Avoid variable time-step simulation paths.
- Monitor tick drift, jitter, and backlog depth for operational health.

## Change Control
Any tick-rate or ordering rule changes require updates to:
- `/project/simulation/game-loop.md`,
- `/project/docs/networking-model.md`,
- affected balancing docs in `/project/systems`,
- and potentially an ADR for major strategy shifts.
