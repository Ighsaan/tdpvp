import {
  TowerDefinition,
  TowerType,
  UnitDefinition,
  UnitType
} from "@tdpvp/shared";

export const unitDefinitions: Record<UnitType, UnitDefinition> = {
  [UnitType.BasicSoldier]: {
    unitType: UnitType.BasicSoldier,
    maxHp: 24,
    moveSpeedPerSecond: 6,
    combatRange: 3,
    attackDamage: 5,
    attackCooldownTicks: 8,
    baseDamage: 7
  },
  [UnitType.FastSoldier]: {
    unitType: UnitType.FastSoldier,
    maxHp: 16,
    moveSpeedPerSecond: 9,
    combatRange: 2,
    attackDamage: 3,
    attackCooldownTicks: 5,
    baseDamage: 5
  }
};

export const towerDefinitions: Record<TowerType, TowerDefinition> = {
  [TowerType.BasicSpawner]: {
    towerType: TowerType.BasicSpawner,
    spawnIntervalTicks: 20,
    spawnedUnitType: UnitType.BasicSoldier,
    cost: 50,
    maxHp: 100
  },
  [TowerType.FastSpawner]: {
    towerType: TowerType.FastSpawner,
    spawnIntervalTicks: 12,
    spawnedUnitType: UnitType.FastSoldier,
    cost: 70,
    maxHp: 90
  }
};
