# Tower System

## Purpose
Define tower placement, behavior, and upgrade interactions for defensive strategy and lane control.

## Design Goals
- Encourage spatial strategy and long-term planning.
- Offer meaningful defensive choices with tradeoffs.
- Prevent static, solved defenses that remove counterplay.

## Placement Rules
- Towers can only be placed in legal build zones.
- Players can only place towers on their own side.
- Neutral middle section is non-buildable.
- Server validates:
  - zone legality,
  - lane validity,
  - ownership constraints,
  - placement limits/caps,
  - no overlap with existing tower positions.
- Placement resolves on authoritative tick and publishes result to clients.

## Implemented MVP Towers
- `basic_spawner`: slower spawn cadence, stronger spawned unit baseline.
- `fast_spawner`: faster spawn cadence, lighter spawned unit baseline.
- Both current tower types are spawner towers.

## Spawning Behavior
- Towers automatically spawn units at deterministic tick intervals.
- Spawned unit type and spawn interval come from server-side tower definitions.
- Players do not directly spawn units in the current gameplay contract.

## Upgrades and Lifecycle
- Towers may support upgrade tiers with defined costs and stat deltas.
- Sell/remove behavior (if enabled) must have explicit refund rules.
- Destroyed towers emit deterministic events for UI and analytics.

## Balance Constraints
- Defensive value must not fully invalidate offensive play.
- Early-game tower strength should not create permanent lockouts.
- Control effects require diminishing returns or limits to avoid stunlock abuse.

## Telemetry for Iteration
- Placement frequency by type/phase.
- Cost-to-impact efficiency.
- Damage contribution split by lane and match phase.
- Upgrade pick rates and win-rate correlation.
