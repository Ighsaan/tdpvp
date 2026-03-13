# Domain Model

This document defines the **canonical vocabulary and domain entities** used in this project.

All AI agents and developers must follow this terminology when designing systems, writing code, or updating documentation.

The goal is to prevent inconsistent naming and ensure that all systems reference the same conceptual model.

If a new concept is introduced, it should be added to this document.

---

# Core Game Concept

The game is a **Realtime PvP Side-Scrolling Tower Defence Game**.

Two players compete by placing towers that spawn units.  
Units move across lanes toward the opponent's base.

Players must destroy the enemy base while defending their own.

The server runs an **authoritative simulation** that determines the outcome of the game.

---

# Core Entities

These entities represent the primary components of the simulation.

---

# BattleRoom

The **BattleRoom** represents a single multiplayer match.

It is hosted by the Colyseus server.

Responsibilities:

- manage player connections
- maintain the authoritative game state
- run the simulation loop
- process player commands
- determine the winner

There is exactly **one BattleRoom per match**.

Associated state object:

```
BattleRoomState
```

---

# BattleRoomState

The **BattleRoomState** is the top-level authoritative state object.

It contains the entire simulation state for the match.

Typical contents:

- room phase
- players
- battlefield
- bases
- towers
- units
- tick counter

This state is synchronized to connected clients.

---

# RoomPhase

Represents the lifecycle state of a match.

Typical phases may include:

- waiting
- preparing
- active
- ended

Only the server may change the room phase.

---

# Player

A **Player** represents a human participant in the match.

There are exactly **two players** in a BattleRoom.

Each player has:

- a side (left or right)
- a base
- owned towers
- owned units

Associated state object:

```
PlayerState
```

---

# PlayerSide

Represents the orientation of a player in the battlefield.

Possible values:

- left
- right

Side determines:

- unit movement direction
- valid tower placement areas
- base ownership

---

# Battlefield

The **Battlefield** represents the playable area where towers and units exist.

The battlefield contains:

- lanes
- placement zones
- bases

Associated state object:

```
BattlefieldState
```

---

# Lane

A **Lane** is a linear path that units travel along.

Key rules:

- units remain in the lane they were spawned in
- lanes operate independently
- units interact only with other units in the same lane

Initial configuration:

```
6 lanes
```

Lane count may become configurable in the future.

Associated state object:

```
LaneState
```

---

# Base

Each player owns a **Base**.

The base is the primary objective of the match.

Rules:

- bases begin with **100 HP**
- enemy units damage the base when they reach it
- the match ends when a base reaches **0 HP**

Associated state object:

```
BaseState
```

---

# Tower

A **Tower** is a structure placed by a player.

Towers belong to a player and exist within that player's valid placement zone.

Initial tower role:

Spawner towers.

Spawner towers automatically create units over time.

Players may:

- place towers
- remove their own towers

Associated state object:

```
TowerState
```

Associated definition:

```
TowerDefinition
```

---

# TowerDefinition

A **TowerDefinition** describes the static configuration of a tower type.

Examples of configuration:

- spawn interval
- unit type spawned
- health
- cost
- placement restrictions

Tower definitions are **data-driven configurations**, not runtime state.

---

# Unit

A **Unit** is a combat entity spawned by a tower.

Units automatically move toward the enemy base.

Units can:

- move along a lane
- engage enemy units
- attack targets
- damage the base

Units are owned by the player who owns the spawning tower.

Associated state object:

```
UnitState
```

Associated definition:

```
UnitDefinition
```

---

# UnitDefinition

A **UnitDefinition** describes the static properties of a unit type.

Examples:

- health
- movement speed
- combat range
- attack damage
- attack cooldown

These are configuration values used to spawn units.

---

# Placement Zone

A **Placement Zone** defines the region where a player may place towers.

Rules:

- players may only place towers within their own placement zone
- players may not place towers in the neutral middle section
- players may not place towers in the enemy placement zone

Placement validation is performed by the server.

---

# Neutral Zone

The **Neutral Zone** is the middle section of the battlefield.

Rules:

- no towers may be placed here
- units may travel through this area
- it separates the two player territories

---

# Commands

Players interact with the simulation by sending **commands** to the server.

Commands represent **intent**, not outcomes.

Example commands:

```
PlaceTowerCommand
RemoveTowerCommand
```

The server validates commands before applying them.

---

# Simulation Tick

The simulation runs on a **fixed server tick**.

Each tick performs deterministic updates.

Typical simulation pipeline:

```
processPlayerCommands
processTowerSpawning
processUnitMovement
processUnitCombat
processBaseInteractions
removeDestroyedEntities
checkWinCondition
```

This structure should remain consistent.

---

# Ownership

Entities may be owned by a player.

Owned entities include:

- towers
- units
- base

Ownership determines:

- command permissions
- combat allegiance
- placement rights

---

# Entity Identifiers

All runtime entities must have unique identifiers.

Examples:

- towerId
- unitId

Identifiers are used for synchronization and simulation management.

---

# Combat

Combat occurs automatically when opposing units are within range.

Rules:

- units only interact with enemy units in the same lane
- units attack the nearest valid enemy within range
- units stop advancing while attacking
- when the enemy dies or leaves range, the unit continues moving

---

# Victory Condition

A player wins when:

```
enemy base HP <= 0
```

The server transitions the match to the **ended** phase.

---

# Terminology Rules

The following terms must remain consistent across the codebase:

| Concept | Required Name |
|-------|------|
| Match Room | BattleRoom |
| Match State | BattleRoomState |
| Player Side | PlayerSide |
| Player Data | PlayerState |
| Battlefield | BattlefieldState |
| Lane | LaneState |
| Tower | TowerState |
| Unit | UnitState |
| Base | BaseState |

AI agents must **not introduce alternative names** for these concepts.

---

# Extending the Domain Model

When introducing new gameplay systems:

1. Add the concept to this document.
2. Define its relationships to existing entities.
3. Ensure naming remains consistent with the existing domain.

Examples of future additions:

- Spell
- Projectile
- Resource
- Deck
- Ability

---

# Final Principle

This document defines the **canonical vocabulary of the game world**.

All systems, code, documentation, and AI-generated work must align with this model.