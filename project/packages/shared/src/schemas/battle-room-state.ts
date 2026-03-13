import { PlayerSide } from "../enums/player-side.js";
import { RoomPhase } from "../enums/room-phase.js";
import { TowerStateStatus } from "../enums/tower-state-status.js";
import { TowerType } from "../enums/tower-type.js";
import { UnitStateStatus } from "../enums/unit-state-status.js";
import { UnitType } from "../enums/unit-type.js";

export interface RoomEvent {
  readonly tick: number;
  readonly type:
    | "player_joined"
    | "player_left"
    | "player_reconnected"
    | "player_ready_changed"
    | "countdown_started"
    | "phase_changed"
    | "lane_count_updated"
    | "match_started"
    | "tower_placed"
    | "tower_removed"
    | "unit_spawned"
    | "unit_destroyed"
    | "base_damaged"
    | "match_ended"
    | "command_rejected";
  readonly message: string;
  readonly playerSessionId?: string;
}

export interface PlayerState {
  readonly sessionId: string;
  readonly username: string;
  readonly side: PlayerSide;
  readonly ready: boolean;
  readonly connected: boolean;
  readonly joinedAtTick: number;
  readonly lastCommandTick: number | null;
  readonly towerCount: number;
  readonly unitCount: number;
}

export interface BaseState {
  readonly ownerSide: PlayerSide;
  readonly hp: number;
  readonly maxHp: number;
  readonly positionX: number;
}

export interface TowerState {
  readonly towerId: string;
  readonly ownerSessionId: string;
  readonly ownerSide: PlayerSide;
  readonly laneIndex: number;
  readonly positionX: number;
  readonly towerType: TowerType;
  readonly status: TowerStateStatus;
  readonly spawnIntervalTicks: number;
  readonly spawnProgressTicks: number;
  readonly spawnedUnitType: UnitType;
}

export interface UnitState {
  readonly unitId: string;
  readonly ownerSessionId: string;
  readonly ownerSide: PlayerSide;
  readonly laneIndex: number;
  readonly unitType: UnitType;
  readonly positionX: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly moveSpeedPerSecond: number;
  readonly combatRange: number;
  readonly attackDamage: number;
  readonly attackCooldownTicks: number;
  readonly attackCooldownRemainingTicks: number;
  readonly baseDamage: number;
  readonly targetUnitId: string | null;
  readonly status: UnitStateStatus;
}

export interface LaneState {
  readonly laneIndex: number;
  readonly towers: readonly TowerState[];
  readonly units: readonly UnitState[];
}

export interface BattlefieldState {
  readonly laneCount: number;
  readonly laneLength: number;
  readonly neutralZoneStartX: number;
  readonly neutralZoneEndX: number;
  readonly leftPlacementZoneStartX: number;
  readonly leftPlacementZoneEndX: number;
  readonly rightPlacementZoneStartX: number;
  readonly rightPlacementZoneEndX: number;
  readonly bases: {
    readonly left: BaseState;
    readonly right: BaseState;
  };
  readonly lanes: readonly LaneState[];
}

export interface BattleRoomState {
  readonly roomId: string;
  readonly matchCode: string;
  readonly hostSessionId: string | null;
  readonly tick: number;
  readonly phase: RoomPhase;
  readonly countdownEndsAtTick: number | null;
  readonly winnerSide: PlayerSide | null;
  readonly players: Record<string, PlayerState>;
  readonly battlefield: BattlefieldState;
  readonly events: readonly RoomEvent[];
}

export type BattleRoomSnapshot = BattleRoomState;
