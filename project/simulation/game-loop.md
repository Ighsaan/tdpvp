# Game Loop (Authoritative Server)

## Purpose
Specify the server-side loop that drives match simulation and ensures deterministic outcomes.

## Fixed-Step Loop
Each room runs a fixed-step loop with consistent tick progression:
1. Read inbound command queue slice for current tick window.
2. Execute validated commands in deterministic order.
3. Execute simulation systems in fixed sequence.
4. Evaluate win conditions and lifecycle transitions.
5. Produce authoritative snapshot payloads.
6. Advance tick counter.

## System Execution Order
Current implemented order:
1. `processPlayerCommands`
2. `processTowerSpawning`
3. `processUnitMovement`
4. `processUnitCombat`
5. `processBaseInteractions`
6. `removeDestroyedEntities`
7. `checkWinCondition`

Exact order must remain stable between versions unless explicitly migrated and documented.

## Current MVP Contract
- Simulation uses a lane-based 1D model per lane.
- Units are lane-locked and move toward enemy base by side direction.
- Towers are spawner structures; players place/remove towers but do not directly spawn units.
- Base HP is authoritative and match ends when one base reaches 0 HP.

## Command Timing Rules
- Commands received before cutoff are eligible for current or next tick based on deterministic policy.
- Late commands never retroactively modify past ticks.
- Invalid commands are rejected and do not mutate simulation state.

## Performance Guardrails
- Keep per-tick work bounded to avoid frame collapse.
- Use backpressure and queue limits for command floods.
- Instrument slow-tick detection and diagnostic events.

## Failure Handling
- If a tick exceeds threshold, preserve correctness over visual smoothness.
- Server must not skip authoritative state transitions silently.
- Operational alerts should capture repeated tick overruns.
