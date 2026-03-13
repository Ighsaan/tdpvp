import {
  BASE_STARTING_HP,
  BattleRoomState,
  BattlefieldState,
  DEFAULT_LANE_COUNT,
  DEFAULT_LANE_LENGTH,
  LEFT_BASE_POSITION_X,
  LEFT_PLACEMENT_ZONE_END_X,
  LEFT_PLACEMENT_ZONE_START_X,
  LaneState,
  NEUTRAL_ZONE_END_X,
  NEUTRAL_ZONE_START_X,
  PlayerSide,
  PlayerState,
  RIGHT_BASE_POSITION_X,
  RIGHT_PLACEMENT_ZONE_END_X,
  RIGHT_PLACEMENT_ZONE_START_X,
  RoomEvent,
  RoomPhase,
  TowerState,
  TowerStateStatus,
  TowerType,
  UnitState,
  UnitStateStatus,
  UnitType
} from "@tdpvp/shared";

export interface MutablePlayerState {
  sessionId: string;
  username: string;
  side: PlayerSide;
  ready: boolean;
  connected: boolean;
  joinedAtTick: number;
  lastCommandTick: number | null;
  towerCount: number;
  unitCount: number;
}

export interface MutableBaseState {
  ownerSide: PlayerSide;
  hp: number;
  maxHp: number;
  positionX: number;
}

export interface MutableTowerState {
  towerId: string;
  ownerSessionId: string;
  ownerSide: PlayerSide;
  laneIndex: number;
  positionX: number;
  towerType: TowerType;
  status: TowerStateStatus;
  spawnIntervalTicks: number;
  spawnProgressTicks: number;
  spawnedUnitType: UnitType;
}

export interface MutableUnitState {
  unitId: string;
  ownerSessionId: string;
  ownerSide: PlayerSide;
  laneIndex: number;
  unitType: UnitType;
  positionX: number;
  hp: number;
  maxHp: number;
  moveSpeedPerSecond: number;
  combatRange: number;
  attackDamage: number;
  attackCooldownTicks: number;
  attackCooldownRemainingTicks: number;
  baseDamage: number;
  targetUnitId: string | null;
  status: UnitStateStatus;
}

export interface MutableLaneState {
  laneIndex: number;
  towers: MutableTowerState[];
  units: MutableUnitState[];
}

export interface MutableBattlefieldState {
  laneCount: number;
  laneLength: number;
  neutralZoneStartX: number;
  neutralZoneEndX: number;
  leftPlacementZoneStartX: number;
  leftPlacementZoneEndX: number;
  rightPlacementZoneStartX: number;
  rightPlacementZoneEndX: number;
  bases: {
    left: MutableBaseState;
    right: MutableBaseState;
  };
  lanes: MutableLaneState[];
}

export interface MutableBattleRoomState {
  roomId: string;
  matchCode: string;
  hostSessionId: string | null;
  tick: number;
  phase: RoomPhase;
  countdownEndsAtTick: number | null;
  winnerSide: PlayerSide | null;
  players: Record<string, MutablePlayerState>;
  battlefield: MutableBattlefieldState;
  events: RoomEvent[];
}

const createInitialBattlefieldState = (
  laneCount: number
): MutableBattlefieldState => ({
  laneCount,
  laneLength: DEFAULT_LANE_LENGTH,
  neutralZoneStartX: NEUTRAL_ZONE_START_X,
  neutralZoneEndX: NEUTRAL_ZONE_END_X,
  leftPlacementZoneStartX: LEFT_PLACEMENT_ZONE_START_X,
  leftPlacementZoneEndX: LEFT_PLACEMENT_ZONE_END_X,
  rightPlacementZoneStartX: RIGHT_PLACEMENT_ZONE_START_X,
  rightPlacementZoneEndX: RIGHT_PLACEMENT_ZONE_END_X,
  bases: {
    left: {
      ownerSide: PlayerSide.Left,
      hp: BASE_STARTING_HP,
      maxHp: BASE_STARTING_HP,
      positionX: LEFT_BASE_POSITION_X
    },
    right: {
      ownerSide: PlayerSide.Right,
      hp: BASE_STARTING_HP,
      maxHp: BASE_STARTING_HP,
      positionX: RIGHT_BASE_POSITION_X
    }
  },
  lanes: Array.from({ length: laneCount }, (_value, laneIndex) => ({
    laneIndex,
    towers: [],
    units: []
  }))
});

export const createInitialBattleRoomState = (
  roomId: string,
  matchCode: string,
  laneCount = DEFAULT_LANE_COUNT
): MutableBattleRoomState => ({
  roomId,
  matchCode,
  hostSessionId: null,
  tick: 0,
  phase: RoomPhase.WaitingForPlayers,
  countdownEndsAtTick: null,
  winnerSide: null,
  players: {},
  battlefield: createInitialBattlefieldState(laneCount),
  events: []
});

export const getNextSide = (currentPlayers: MutablePlayerState[]): PlayerSide => {
  const hasLeft = currentPlayers.some((player) => player.side === PlayerSide.Left);
  return hasLeft ? PlayerSide.Right : PlayerSide.Left;
};

export const getEnemySide = (side: PlayerSide): PlayerSide =>
  side === PlayerSide.Left ? PlayerSide.Right : PlayerSide.Left;

export const recalculatePlayerEntityCounts = (
  state: MutableBattleRoomState
): void => {
  const towerCounts = new Map<string, number>();
  const unitCounts = new Map<string, number>();

  for (const lane of state.battlefield.lanes) {
    for (const tower of lane.towers) {
      towerCounts.set(
        tower.ownerSessionId,
        (towerCounts.get(tower.ownerSessionId) ?? 0) + 1
      );
    }

    for (const unit of lane.units) {
      unitCounts.set(
        unit.ownerSessionId,
        (unitCounts.get(unit.ownerSessionId) ?? 0) + 1
      );
    }
  }

  for (const player of Object.values(state.players)) {
    player.towerCount = towerCounts.get(player.sessionId) ?? 0;
    player.unitCount = unitCounts.get(player.sessionId) ?? 0;
  }
};

export const toSnapshot = (
  state: MutableBattleRoomState
): BattleRoomState => {
  const players: Record<string, PlayerState> = Object.fromEntries(
    Object.entries(state.players).map(([sessionId, player]) => [
      sessionId,
      {
        sessionId: player.sessionId,
        username: player.username,
        side: player.side,
        ready: player.ready,
        connected: player.connected,
        joinedAtTick: player.joinedAtTick,
        lastCommandTick: player.lastCommandTick,
        towerCount: player.towerCount,
        unitCount: player.unitCount
      }
    ])
  );

  const lanes: LaneState[] = state.battlefield.lanes.map((lane) => {
    const towers: TowerState[] = lane.towers.map((tower) => ({
      towerId: tower.towerId,
      ownerSessionId: tower.ownerSessionId,
      ownerSide: tower.ownerSide,
      laneIndex: tower.laneIndex,
      positionX: tower.positionX,
      towerType: tower.towerType,
      status: tower.status,
      spawnIntervalTicks: tower.spawnIntervalTicks,
      spawnProgressTicks: tower.spawnProgressTicks,
      spawnedUnitType: tower.spawnedUnitType
    }));
    const units: UnitState[] = lane.units.map((unit) => ({
      unitId: unit.unitId,
      ownerSessionId: unit.ownerSessionId,
      ownerSide: unit.ownerSide,
      laneIndex: unit.laneIndex,
      unitType: unit.unitType,
      positionX: unit.positionX,
      hp: unit.hp,
      maxHp: unit.maxHp,
      moveSpeedPerSecond: unit.moveSpeedPerSecond,
      combatRange: unit.combatRange,
      attackDamage: unit.attackDamage,
      attackCooldownTicks: unit.attackCooldownTicks,
      attackCooldownRemainingTicks: unit.attackCooldownRemainingTicks,
      baseDamage: unit.baseDamage,
      targetUnitId: unit.targetUnitId,
      status: unit.status
    }));

    return {
      laneIndex: lane.laneIndex,
      towers,
      units
    };
  });

  const battlefield: BattlefieldState = {
    laneCount: state.battlefield.laneCount,
    laneLength: state.battlefield.laneLength,
    neutralZoneStartX: state.battlefield.neutralZoneStartX,
    neutralZoneEndX: state.battlefield.neutralZoneEndX,
    leftPlacementZoneStartX: state.battlefield.leftPlacementZoneStartX,
    leftPlacementZoneEndX: state.battlefield.leftPlacementZoneEndX,
    rightPlacementZoneStartX: state.battlefield.rightPlacementZoneStartX,
    rightPlacementZoneEndX: state.battlefield.rightPlacementZoneEndX,
    bases: {
      left: { ...state.battlefield.bases.left },
      right: { ...state.battlefield.bases.right }
    },
    lanes
  };

  return {
    roomId: state.roomId,
    matchCode: state.matchCode,
    hostSessionId: state.hostSessionId,
    tick: state.tick,
    phase: state.phase,
    countdownEndsAtTick: state.countdownEndsAtTick,
    winnerSide: state.winnerSide,
    players,
    battlefield,
    events: state.events.map((event) => ({ ...event }))
  };
};

export const setBattlefieldLaneCount = (
  state: MutableBattleRoomState,
  laneCount: number
): void => {
  state.battlefield.laneCount = laneCount;
  state.battlefield.lanes = Array.from({ length: laneCount }, (_value, laneIndex) => ({
    laneIndex,
    towers: [],
    units: []
  }));
};
