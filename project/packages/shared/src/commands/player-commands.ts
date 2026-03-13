import { TowerType } from "../enums/tower-type.js";

export enum PlayerCommandType {
  Ready = "player.ready",
  Ping = "player.ping",
  PlaceTower = "player.place_tower",
  RemoveTower = "player.remove_tower",
  UpdateLobbyLaneCount = "player.update_lobby_lane_count",
  StartMatch = "player.start_match"
}

export interface ReadyCommand {
  readonly type: PlayerCommandType.Ready;
  readonly ready: boolean;
}

export interface PingCommand {
  readonly type: PlayerCommandType.Ping;
  readonly nonce: string;
  readonly sentAtClientMs: number;
}

export interface PlaceTowerCommand {
  readonly type: PlayerCommandType.PlaceTower;
  readonly towerType: TowerType;
  readonly laneIndex: number;
  readonly positionX: number;
}

export interface RemoveTowerCommand {
  readonly type: PlayerCommandType.RemoveTower;
  readonly towerId: string;
}

export interface UpdateLobbyLaneCountCommand {
  readonly type: PlayerCommandType.UpdateLobbyLaneCount;
  readonly laneCount: number;
}

export interface StartMatchCommand {
  readonly type: PlayerCommandType.StartMatch;
}

export type PlayerCommand =
  | ReadyCommand
  | PingCommand
  | PlaceTowerCommand
  | RemoveTowerCommand
  | UpdateLobbyLaneCountCommand
  | StartMatchCommand;
