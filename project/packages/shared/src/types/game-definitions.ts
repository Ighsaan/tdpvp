import { TowerType } from "../enums/tower-type.js";
import { UnitType } from "../enums/unit-type.js";

export interface TowerDefinition {
  readonly towerType: TowerType;
  readonly spawnIntervalTicks: number;
  readonly spawnedUnitType: UnitType;
  readonly cost: number;
  readonly maxHp: number;
}

export interface UnitDefinition {
  readonly unitType: UnitType;
  readonly maxHp: number;
  readonly moveSpeedPerSecond: number;
  readonly combatRange: number;
  readonly attackDamage: number;
  readonly attackCooldownTicks: number;
  readonly baseDamage: number;
}
