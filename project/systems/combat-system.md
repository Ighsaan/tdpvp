# Combat System

## Purpose
Define how damage, targeting, status effects, and deaths are resolved in deterministic authoritative simulation.

## Combat Pipeline
1. Gather valid lane-local combat participants.
2. Resolve nearest enemy targets in-range within each lane.
3. Units in-range stop movement and attack on cooldown.
4. Apply deterministic damage to targets.
5. Mark destroyed units and clean up in lifecycle pass.
6. Process base interaction for units that reach enemy base.

## Deterministic Requirements
- Event ordering is consistent for identical inputs.
- Combat calculations avoid non-reproducible randomness.
- Simultaneous lethal events follow explicit tie-resolution rules.
- Damage timestamps are aligned to server tick ids.

## Damage and Mitigation Model
- Support configurable damage types and mitigation stats.
- Define minimum damage floor behavior explicitly.
- Apply resistance/armor in consistent operation order.
- Ensure modifiers are bounded to avoid infinite scaling loops.

## Status Effects
- Effects include slow, stun, burn, buffs, debuffs, and utility tags.
- Every effect has:
  - source and target,
  - duration in ticks,
  - stacking policy,
  - expiry behavior.
- Stacking rules must be explicit (additive, capped, replace strongest, etc.).

Current MVP contract does not yet include advanced status effects; this section remains forward-looking.

## Death and Cleanup
- Entity death is authoritative and final for simulation state.
- On-death triggers execute in deterministic order.
- Cleanup must remove invalid references and scheduled actions.
- Reward attribution (if any) follows strict ownership rules.

## Competitive Readability Requirements
- Key combat outcomes should map to clear replicated events.
- Visual effects must reflect authoritative outcomes, not predicted guesses.
- Hidden combat rules are discouraged unless necessary for anti-cheat.

## Balance and Safety Checks
- Prevent one-frame unavoidable kill chains without response windows.
- Limit crowd control lock duration through constraints.
- Monitor burst-to-survival ratios across match phases.
