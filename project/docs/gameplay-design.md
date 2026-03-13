# Gameplay Design

## Match Flow
1. `Pre-Match`
   - Players are matched and assigned sides.
   - Deck/loadout is locked for the match.
   - Countdown begins after both players are ready.
2. `Early Game`
   - Lower mana throughput encourages scouting and low-cost plays.
   - Players establish baseline tower lines and lane control.
3. `Mid Game`
   - Mana growth enables stronger unit compositions and ability chains.
   - Counterplay and adaptation become central.
4. `Late Game`
   - High-pressure windows, decisive ability timing, and objective races.
   - Defensive mistakes are heavily punished.
5. `Resolution`
   - Win condition is reached and authoritative server finalizes result.

## Unit Spawning
- Units are spawned automatically by player-owned spawner towers.
- Players do not directly spawn units in the current core model.
- Tower spawn cadence and spawned unit type are server-authoritative definition data.
- Unit archetypes should remain role-based and data-driven as roster expands.

## Tower Placement
- Towers are placed in legal build zones on player territory.
- Neutral middle zone is non-buildable.
- Each tower type should have explicit tactical purpose (DPS, control, anti-air, utility).
- Placement and upgrades are server-validated for cost, slot limits, and positional rules.
- Tower economy must balance long-term defense value against immediate offensive pressure.

## Abilities
- Abilities provide tactical spikes (damage burst, crowd control, buffs, debuffs, utility).
- Cast legality checks include cooldown, mana, target validity, and timing windows.
- Abilities should create counterplay opportunities, not unavoidable outcomes.
- Visual telegraphing and feedback are required for competitive readability.

## Mana System
- Mana is the primary action resource for unit spawning, tower actions, and abilities.
- Regeneration should be predictable and tuneable by game phase.
- Optional burst mechanisms (e.g., objective rewards) must be explicit and symmetric.
- Economy tuning should prevent runaway snowball while still rewarding good play.

## Win Conditions
- Primary condition: destroy opponent core/base objective.
- Secondary condition (time cap fallback): objective health comparison or tie-break logic.
- Win/loss is computed only by authoritative server state.
- Match end must be deterministic and resistant to late/invalid client commands.

## Balance Intent
- Reward timing, adaptation, and resource discipline.
- Avoid hard lockout states with no strategic response.
- Keep average comeback possibility meaningful without removing advantages earned by better play.
