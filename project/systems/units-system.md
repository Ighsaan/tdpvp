# Units System

## Purpose
Define how combat units are spawned, behave, and interact within the authoritative simulation.

## Unit Roles
- `Frontline`: absorb damage and hold lane pressure.
- `Ranged`: provide sustained damage from safer distance.
- `Support`: buff allies, debuff enemies, or provide utility.
- `Siege`: high structure/objective pressure with clear weaknesses.

## Spawn Rules
- Units are spawned by player-owned spawner towers.
- Spawn timing and spawned unit type are server-authoritative.
- Spawned units inherit owner side/session and lane from spawning tower.
- Units are inserted on deterministic tick boundaries only.

## Core Unit Attributes
- Health and maximum health.
- Movement speed.
- Attack range and attack interval.
- Damage profile (single-target, splash, etc.).
- Targeting priority tags.
- Cost and optional tech/deck requirements.

## Behavior Model
- Units follow lane/path movement until valid target engagement.
- Units are lane-locked and do not switch lanes in current MVP contract.
- Target selection follows deterministic priority rules.
- Attack cadence is tick-based; no client timing authority.
- Death triggers deterministic cleanup and reward/event logic.
- Units that reach enemy base deal base damage and are removed.

## Counterplay Principles
- Every high-impact unit should have at least one practical counter class.
- Burst-heavy units should have vulnerability windows.
- High durability units should trade off speed or damage.
- Support units must provide value without hard-locking interactions.

## Balance Knobs
- Mana cost.
- Health scaling.
- Damage and attack speed.
- Movement speed.
- Spawn cooldown/global cooldown contribution.

## Data and Telemetry Needs
- Spawn success/failure reasons.
- Per-unit lifetime damage and survival time.
- Pick/win correlation by matchup context.
- Usage trends by rank bracket for balance iteration.
