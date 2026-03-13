import {
  PlayerSide,
  RoomPhase,
  RoomEvent,
  SERVER_TICK_RATE,
  TowerDefinition,
  TowerStateStatus,
  TowerType,
  UnitDefinition,
  UnitStateStatus,
  UnitType
} from "@tdpvp/shared";
import {
  MutableBattleRoomState,
  MutableUnitState,
  getEnemySide
} from "../state/battle-room-state.js";

type UnitDefinitionMap = Record<UnitType, UnitDefinition>;
type TowerDefinitionByType = Record<TowerType, TowerDefinition>;

const byUnitId = (a: MutableUnitState, b: MutableUnitState): number =>
  a.unitId.localeCompare(b.unitId);

const byTowerId = <T extends { towerId: string }>(a: T, b: T): number =>
  a.towerId.localeCompare(b.towerId);

const getNearestEnemyInRange = (
  unit: MutableUnitState,
  candidates: readonly MutableUnitState[]
): MutableUnitState | null => {
  let best: MutableUnitState | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (
      candidate.ownerSide === unit.ownerSide ||
      candidate.status !== UnitStateStatus.Active ||
      candidate.hp <= 0
    ) {
      continue;
    }

    const distance = Math.abs(candidate.positionX - unit.positionX);
    if (distance <= unit.combatRange && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
};

export const processTowerSpawning = (
  state: MutableBattleRoomState,
  towerDefinitions: TowerDefinitionByType,
  unitDefinitions: UnitDefinitionMap,
  nextUnitId: () => string,
  addEvent: (event: RoomEvent) => void
): void => {
  if (state.phase !== RoomPhase.Active) {
    return;
  }

  for (const lane of state.battlefield.lanes) {
    const orderedTowers = [...lane.towers].sort(byTowerId);
    for (const tower of orderedTowers) {
      if (tower.status !== TowerStateStatus.Active) {
        continue;
      }

      tower.spawnProgressTicks += 1;
      if (tower.spawnProgressTicks < tower.spawnIntervalTicks) {
        continue;
      }

      tower.spawnProgressTicks -= tower.spawnIntervalTicks;

      const towerDefinition = towerDefinitions[tower.towerType];
      const unitDefinition = unitDefinitions[towerDefinition.spawnedUnitType];
      const unitId = nextUnitId();
      lane.units.push({
        unitId,
        ownerSessionId: tower.ownerSessionId,
        ownerSide: tower.ownerSide,
        laneIndex: lane.laneIndex,
        unitType: unitDefinition.unitType,
        positionX: tower.positionX,
        hp: unitDefinition.maxHp,
        maxHp: unitDefinition.maxHp,
        moveSpeedPerSecond: unitDefinition.moveSpeedPerSecond,
        combatRange: unitDefinition.combatRange,
        attackDamage: unitDefinition.attackDamage,
        attackCooldownTicks: unitDefinition.attackCooldownTicks,
        attackCooldownRemainingTicks: 0,
        baseDamage: unitDefinition.baseDamage,
        targetUnitId: null,
        status: UnitStateStatus.Active
      });

      addEvent({
        tick: state.tick,
        type: "unit_spawned",
        playerSessionId: tower.ownerSessionId,
        message: `Tower ${tower.towerId} spawned unit ${unitId} on lane ${lane.laneIndex}.`
      });
    }
  }
};

export const processUnitMovement = (state: MutableBattleRoomState): void => {
  if (state.phase !== RoomPhase.Active) {
    return;
  }

  for (const lane of state.battlefield.lanes) {
    const activeUnits = lane.units
      .filter((unit) => unit.status === UnitStateStatus.Active && unit.hp > 0)
      .sort(byUnitId);

    for (const unit of activeUnits) {
      const nearbyEnemy = getNearestEnemyInRange(unit, activeUnits);
      if (nearbyEnemy) {
        unit.targetUnitId = nearbyEnemy.unitId;
        continue;
      }

      unit.targetUnitId = null;
      const direction = unit.ownerSide === PlayerSide.Left ? 1 : -1;
      const movementDelta = unit.moveSpeedPerSecond / SERVER_TICK_RATE;
      const nextX = unit.positionX + direction * movementDelta;
      unit.positionX = Math.max(0, Math.min(state.battlefield.laneLength, nextX));
    }
  }
};

export const processUnitCombat = (
  state: MutableBattleRoomState,
  addEvent: (event: RoomEvent) => void
): void => {
  if (state.phase !== RoomPhase.Active) {
    return;
  }

  for (const lane of state.battlefield.lanes) {
    const activeUnits = lane.units
      .filter((unit) => unit.status === UnitStateStatus.Active && unit.hp > 0)
      .sort(byUnitId);
    const pendingDamageByUnitId = new Map<string, number>();

    for (const unit of activeUnits) {
      if (unit.attackCooldownRemainingTicks > 0) {
        unit.attackCooldownRemainingTicks -= 1;
      }

      const target = getNearestEnemyInRange(unit, activeUnits);
      if (!target) {
        unit.targetUnitId = null;
        continue;
      }

      unit.targetUnitId = target.unitId;

      if (unit.attackCooldownRemainingTicks > 0) {
        continue;
      }

      pendingDamageByUnitId.set(
        target.unitId,
        (pendingDamageByUnitId.get(target.unitId) ?? 0) + unit.attackDamage
      );
      unit.attackCooldownRemainingTicks = unit.attackCooldownTicks;
    }

    for (const [targetUnitId, pendingDamage] of pendingDamageByUnitId.entries()) {
      const targetUnit = lane.units.find((unit) => unit.unitId === targetUnitId);
      if (!targetUnit || targetUnit.status !== UnitStateStatus.Active) {
        continue;
      }

      targetUnit.hp = Math.max(0, targetUnit.hp - pendingDamage);
      if (targetUnit.hp > 0) {
        continue;
      }

      targetUnit.status = UnitStateStatus.Destroyed;
      targetUnit.targetUnitId = null;

      addEvent({
        tick: state.tick,
        type: "unit_destroyed",
        playerSessionId: targetUnit.ownerSessionId,
        message: `Unit ${targetUnit.unitId} was destroyed in lane ${lane.laneIndex}.`
      });
    }
  }
};

export const processBaseInteractions = (
  state: MutableBattleRoomState,
  addEvent: (event: RoomEvent) => void
): void => {
  if (state.phase !== RoomPhase.Active) {
    return;
  }

  for (const lane of state.battlefield.lanes) {
    for (const unit of lane.units) {
      if (unit.status !== UnitStateStatus.Active || unit.hp <= 0) {
        continue;
      }

      const hasReachedRightBase =
        unit.ownerSide === PlayerSide.Left &&
        unit.positionX >= state.battlefield.laneLength;
      const hasReachedLeftBase =
        unit.ownerSide === PlayerSide.Right &&
        unit.positionX <= 0;

      if (!hasReachedRightBase && !hasReachedLeftBase) {
        continue;
      }

      const enemySide = getEnemySide(unit.ownerSide);
      const base =
        enemySide === PlayerSide.Left
          ? state.battlefield.bases.left
          : state.battlefield.bases.right;

      base.hp = Math.max(0, base.hp - unit.baseDamage);
      unit.status = UnitStateStatus.Destroyed;
      unit.targetUnitId = null;

      addEvent({
        tick: state.tick,
        type: "base_damaged",
        playerSessionId: unit.ownerSessionId,
        message: `Unit ${unit.unitId} hit ${enemySide} base for ${unit.baseDamage}.`
      });
    }
  }
};

export const removeDestroyedEntities = (state: MutableBattleRoomState): void => {
  for (const lane of state.battlefield.lanes) {
    lane.units = lane.units.filter(
      (unit) => unit.status === UnitStateStatus.Active && unit.hp > 0
    );
    lane.towers = lane.towers.filter(
      (tower) => tower.status === TowerStateStatus.Active
    );
  }
};

export const checkWinCondition = (
  state: MutableBattleRoomState,
  addEvent: (event: RoomEvent) => void
): void => {
  if (state.phase !== RoomPhase.Active) {
    return;
  }

  const leftHp = state.battlefield.bases.left.hp;
  const rightHp = state.battlefield.bases.right.hp;
  if (leftHp > 0 && rightHp > 0) {
    return;
  }

  if (leftHp <= 0 && rightHp <= 0) {
    state.winnerSide = null;
  } else {
    state.winnerSide = leftHp > 0 ? PlayerSide.Left : PlayerSide.Right;
  }

  state.phase = RoomPhase.Ended;
  state.countdownEndsAtTick = null;

  addEvent({
    tick: state.tick,
    type: "match_ended",
    message:
      state.winnerSide === null
        ? "Match ended in a draw."
        : `Match ended. Winner: ${state.winnerSide}.`
  });
};

export const isPlacementPositionValid = (
  state: MutableBattleRoomState,
  side: PlayerSide,
  positionX: number
): boolean => {
  const inNeutralZone =
    positionX >= state.battlefield.neutralZoneStartX &&
    positionX <= state.battlefield.neutralZoneEndX;
  if (inNeutralZone) {
    return false;
  }

  if (side === PlayerSide.Left) {
    return (
      positionX >= state.battlefield.leftPlacementZoneStartX &&
      positionX <= state.battlefield.leftPlacementZoneEndX
    );
  }

  return (
    positionX >= state.battlefield.rightPlacementZoneStartX &&
    positionX <= state.battlefield.rightPlacementZoneEndX
  );
};
