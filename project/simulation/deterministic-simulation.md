# Deterministic Simulation

## Goal
Ensure identical initial state plus identical ordered command stream always produce identical match outcomes on the authoritative server.

## Determinism Requirements
- Stable system execution order each tick.
- Stable command ordering and tie-break logic.
- No non-seeded randomness in simulation logic.
- No simulation decisions based on non-deterministic external state.

## Randomness Policy
- All random behavior must use deterministic seeded RNG.
- Seed source is set at match start and retained for diagnostics/replay.
- Random calls must be deterministic in count/order across equivalent runs.

## Numeric Consistency
- Prefer integer/fixed-point approaches for critical combat/resource calculations where practical.
- If floating point is used, constrain operations and order to reduce divergence risk.
- Keep operation order explicit and consistent.

## Event Ordering
- Simultaneous events must resolve by documented priorities.
- Priority dimensions can include:
  - tick id,
  - event class priority,
  - entity id tie-breaker.
- Ordering rules must remain stable and test-covered.

## Current Lane Contract
- Simulation uses canonical 1D lane positions per lane.
- Units do not switch lanes in current contract.
- Engagement checks are lane-local and range-based.
- Base interaction triggers when unit position reaches enemy base boundary.

## Reproducibility Tooling (Planned)
- Determinism test harness with fixed seeds and scripted command streams.
- Snapshot hash checks at selected tick intervals.
- Replay validation to confirm identical outcome reproduction.

## Common Determinism Risks
- Unordered map/set iteration in critical paths.
- Time-based logic using local wall-clock reads.
- Async race conditions mutating simulation state out of tick phase.
- Hidden side effects in utility functions.

## Required Validation
- Add tests for simultaneous command scenarios.
- Validate reconnect does not alter authoritative simulation sequence.
- Track and investigate desync indicators in telemetry.
