export const BATTLE_ROOM_NAME = "battle_room";
export const MAX_BATTLE_PLAYERS = 2;

export const SERVER_TICK_RATE = 10;
export const SERVER_TICK_INTERVAL_MS = 1000 / SERVER_TICK_RATE;
export const COUNTDOWN_TICKS = SERVER_TICK_RATE * 3;
export const SNAPSHOT_BROADCAST_EVERY_TICKS = 2;

export const DEFAULT_LANE_COUNT = 6;
export const DEFAULT_LANE_LENGTH = 100;
export const BASE_STARTING_HP = 100;

export const LEFT_BASE_POSITION_X = 0;
export const RIGHT_BASE_POSITION_X = DEFAULT_LANE_LENGTH;

export const LEFT_PLACEMENT_ZONE_START_X = 5;
export const LEFT_PLACEMENT_ZONE_END_X = 40;
export const NEUTRAL_ZONE_START_X = 41;
export const NEUTRAL_ZONE_END_X = 59;
export const RIGHT_PLACEMENT_ZONE_START_X = 60;
export const RIGHT_PLACEMENT_ZONE_END_X = 95;

export const MAX_TOWERS_PER_PLAYER = 24;
export const MIN_LOBBY_LANE_COUNT = 2;
export const MAX_LOBBY_LANE_COUNT = 6;
