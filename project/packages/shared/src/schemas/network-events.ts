import { PlayerCommandType } from "../commands/player-commands.js";
import { BattleRoomSnapshot } from "./battle-room-state.js";

export type CommandRejectedReason =
  | "invalid_payload"
  | "unknown_player"
  | "invalid_phase"
  | "invalid_host_permission"
  | "invalid_player_count"
  | "invalid_lane"
  | "invalid_lane_count"
  | "invalid_tower_type"
  | "invalid_placement_zone"
  | "invalid_tower_not_found"
  | "invalid_tower_ownership"
  | "rate_limited"
  | "invalid_command";

export interface CommandRejectedEvent {
  readonly commandType: PlayerCommandType | "unknown";
  readonly reason: CommandRejectedReason;
  readonly message: string;
  readonly serverTick: number;
}

export interface PongEvent {
  readonly nonce: string;
  readonly serverTick: number;
  readonly serverTimeMs: number;
}

export type RoomSnapshotEvent = BattleRoomSnapshot;
