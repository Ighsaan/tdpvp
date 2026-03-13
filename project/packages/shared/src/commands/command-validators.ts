import { TowerType } from "../enums/tower-type.js";
import {
  PingCommand,
  PlaceTowerCommand,
  PlayerCommand,
  PlayerCommandType,
  ReadyCommand,
  RemoveTowerCommand,
  StartMatchCommand,
  UpdateLobbyLaneCountCommand
} from "./player-commands.js";

const isObjectRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTowerType = (value: unknown): value is TowerType =>
  value === TowerType.BasicSpawner || value === TowerType.FastSpawner;

export const isReadyCommand = (value: unknown): value is ReadyCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value["type"] === PlayerCommandType.Ready &&
    typeof value["ready"] === "boolean"
  );
};

export const isPingCommand = (value: unknown): value is PingCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value["type"] === PlayerCommandType.Ping &&
    typeof value["nonce"] === "string" &&
    typeof value["sentAtClientMs"] === "number"
  );
};

export const isPlaceTowerCommand = (
  value: unknown
): value is PlaceTowerCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value["type"] === PlayerCommandType.PlaceTower &&
    isTowerType(value["towerType"]) &&
    typeof value["laneIndex"] === "number" &&
    Number.isInteger(value["laneIndex"]) &&
    typeof value["positionX"] === "number"
  );
};

export const isRemoveTowerCommand = (
  value: unknown
): value is RemoveTowerCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value["type"] === PlayerCommandType.RemoveTower &&
    typeof value["towerId"] === "string"
  );
};

export const isUpdateLobbyLaneCountCommand = (
  value: unknown
): value is UpdateLobbyLaneCountCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    value["type"] === PlayerCommandType.UpdateLobbyLaneCount &&
    typeof value["laneCount"] === "number" &&
    Number.isInteger(value["laneCount"])
  );
};

export const isStartMatchCommand = (
  value: unknown
): value is StartMatchCommand => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return value["type"] === PlayerCommandType.StartMatch;
};

export const isPlayerCommand = (value: unknown): value is PlayerCommand =>
  isReadyCommand(value) ||
  isPingCommand(value) ||
  isPlaceTowerCommand(value) ||
  isRemoveTowerCommand(value) ||
  isUpdateLobbyLaneCountCommand(value) ||
  isStartMatchCommand(value);
