# Client 3D Rendering Architecture

## Purpose
Define the ThreeJS presentation architecture for `/project/apps/client` while preserving authoritative multiplayer behavior.

## Scope
This document covers client-side rendering structure only. It does not change server simulation ownership, shared command contracts, or lane-based deterministic gameplay rules.

React shell responsibilities are documented separately in `/project/docs/react-ui-shell-flow.md`.

## Authoritative Boundary
The client remains presentation-only:
- consumes authoritative `BattleRoomSnapshot` state,
- renders bases, towers, units, lanes, and placement zones,
- sends player intent commands (`ready`, `ping`, `place_tower`, `remove_tower`).

The server remains authoritative for combat, movement truth, placement validation, base damage, and win resolution.

## World-to-Render Mapping
Canonical mapping:
- `X` axis: left-to-right battle progression.
- `Z` axis: lane distribution.
- `Y` axis: visual height.

This matches lane-based simulation semantics and keeps left-vs-right readability stable.

## Scene Structure
Primary client scene modules are organized under `/project/apps/client/src`:
- `game/rendering`: ThreeJS scene bootstrap, lights, static battlefield meshes, resize handling, render loop.
- `game/camera`: fixed gameplay camera setup and interpolation toward static framing targets.
- `game/entities`: authoritative state to mesh mapping for `BaseState`, `TowerState`, and `UnitState` visuals.
- `game/scenes`: scene lifecycle and orchestration between networking, state consumption, rendering, and HUD.
- `game/ui`: developer HUD/debug formatting.
- `network`: Colyseus transport abstraction.
- `state`: client-side view state helpers for authoritative snapshot consumption.
- `config` and `lib`: render constants and shared mapping helpers.

## Camera Model
Camera strategy is fixed and gameplay-readable:
- single static strategic angle,
- both bases visible in one frame,
- left base rendered on left side of screen and right base on right side,
- no free-camera gameplay movement,
- lane selection input does not move camera framing.

Current implementation uses a perspective camera with elevated fixed offset and center look-at to preserve tactical readability.

## Visual Model (MVP)
The 3D battlefield uses intentional placeholders:
- flat battlefield board,
- six lane separators,
- colored placement and neutral zones,
- simple base meshes,
- tower visuals that can be either:
  - model-backed spawner visuals (when registered),
  - placeholder primitive meshes (fallback),
- unit visuals that can be either:
  - animated GLB model instances driven by a model registry,
  - primitive placeholders for unit types without model definitions.

This is deliberate to prioritize simulation clarity and rapid iteration over final art polish.

## Unit Model Asset Storage
- Unit model assets live under `/project/apps/client/public/assets/models/units`.
- Current first integrated asset: `/project/apps/client/public/assets/models/units/spawn-ninja.glb`.
- Future unit model GLBs should be added under the same folder for a stable and discoverable pipeline.

## Tower Model Asset Storage
- Tower model assets live under `/project/apps/client/public/assets/models/spawners`.
- Current integrated asset: `/project/apps/client/public/assets/models/spawners/spawner-ninja.glb`.

## Unit Model Registry
- Unit models are configured by a client-only registry keyed by `UnitType`.
- Each registry definition includes:
  - asset path,
  - model scale,
  - rotation correction,
  - optional positional offset,
  - animation clip mapping from internal animation names to source clip names.
- Current modeled unit coverage:
  - `basic_soldier` -> `spawn-ninja.glb`
  - `fast_soldier` -> `spawn-ninja.glb` (scaled variant)
- Missing registry entries are expected for unsupported unit types and must fall back to placeholder visuals.

## Tower Model Registry
- Tower models are configured by a client-side tower model registry keyed by `TowerType`.
- Current modeled tower coverage:
  - `basic_spawner` -> `spawner-ninja.glb`
- `fast_spawner` currently remains on placeholder visuals by design.

## Internal Unit Animation Vocabulary
Client unit visuals use the internal animation names:
- `idle`
- `walk`
- `attackPrimary`
- `attackSecondary`
- `hitReact`
- `death`

Current source clip mapping for `spawn-ninja.glb`:
- `Walk` -> `walk`
- `Punch` -> `attackPrimary`
- `Weapon` -> `attackSecondary`
- `HitReact` -> `hitReact`
- `Death` -> `death`

If an `idle` clip is missing in the source asset, client visuals use an idle fallback strategy (rest pose/frozen locomotion pose) instead of failing.

## Animation Blending and Priorities
- Animation transitions are data-driven in the unit model registry via:
  - default transition duration,
  - per-transition override durations (`from -> to`),
  - animation priorities for interrupt rules.
- One-shot actions (`attackPrimary`, `attackSecondary`, `hitReact`, `death`) use priority-gated interrupts.
- `death` is terminal and cannot be interrupted by lower-priority clips.

## Authoritative Hit React Trigger Model
- Hit reaction is triggered from authoritative state deltas (HP drops between snapshots).
- Trigger cadence is gated by per-model hit-react cooldown settings to avoid spam on burst damage ticks.
- If `hitReact` clip mapping is absent, visuals fall back to locomotion/idle without affecting gameplay state.

## Animation Event Sync
- Registry definitions can map normalized clip markers per animation (for example: `windup`, `impact`).
- Attack clips are triggered from authoritative attack cues; marker processing then drives timed presentation-only effects.
- Current impact marker usage: short per-unit impact pulse synchronized to attack clip progression.
- Event sync remains visual-only and never writes authoritative gameplay state.

## Unit Model Loader Lifecycle
The client model loader follows this lifecycle:
1. request GLB by asset path via `GLTFLoader`.
2. cache the loaded GLTF promise by path so each GLB file is loaded once.
3. acquire per-unit scene instances from a model instance pool (or clone from cached source scene when pool is empty).
4. create one `AnimationMixer` per visual unit instance.
5. register mapped animation clips once per unit instance and play internal animations through that mapping.
6. release model instances back into the pool on unit disposal for reuse.

This keeps loading deterministic and prevents per-unit network or disk reload churn.

## Model Pooling and Performance Guardrails
- Unit visuals reuse a bounded per-asset model pool to reduce clone/allocation churn during spawn/despawn spikes.
- Pooled models are reset before reuse (transform reset + skeleton pose reset).
- Unit model render profile supports per-model shadow tuning (`castShadow` and `receiveShadow`) for performance tradeoffs.
- Unit snapshot mapping avoids per-unit temporary vector allocations in the hot render path.
- Runtime pool stats are exposed and logged on scene disposal for developer profiling (`cloneCount`, `reusedFromPoolCount`, `returnedToPoolCount`, `droppedFromPoolCount`).

## Unit Visual Controller Responsibilities
- Own unit visual object lifecycle and scene attachment.
- Keep visual transforms synchronized to authoritative snapshot state.
- Manage one `AnimationMixer` for the unit visual lifetime.
- Play internal animation names based on minimal authoritative cues.
- Dispose model/placeholder resources when the unit is removed.

The controller is presentation-only and does not own gameplay logic.

## Developer Diagnostics
Client rendering should emit concise warnings for:
- missing unit model registry entries (placeholder fallback in use),
- missing mapped animation clips for a model definition,
- model load failures that force placeholder fallback.

Warnings should be emitted once per unique issue key to avoid noisy logs.

## Adding a New Unit Model
1. Add the GLB file under `/project/apps/client/public/assets/models/units`.
2. Add/update the unit definition entry in the unit model registry:
   - asset path,
   - transform correction (scale/rotation/offset),
   - animation map from internal names to source clip names.
3. Verify fallback behavior remains intact for unit types with no registry entry.
4. Validate mixer update behavior in the global render loop.
5. Update this doc and create/update task files for deferred improvements.

## Rendering Lifecycle
1. initialize renderer, scene, camera, and lights.
2. subscribe to authoritative multiplayer state.
3. rebuild static battlefield meshes when battlefield dimensions/zones change.
4. update base/tower/unit meshes from each authoritative snapshot.
5. run render loop for camera smoothing, unit interpolation, and animation mixer updates.
6. cleanup listeners, meshes, and renderer on scene dispose.

Mount behavior:
- React mounts the gameplay renderer only when authoritative room phase is `active`.
- Non-battle product flow remains in React screens.

## Non-Goals
- client-authoritative simulation logic,
- 3D physics-driven gameplay,
- free movement/pathfinding conversion,
- final art pipeline.

## Planned Follow-Ups
See `/project/tasks` follow-up 3D tasks for animation, placement preview, highlighting, perspective variants, and rendering performance improvements.
