import { TowerType } from "@tdpvp/shared";

export interface TowerModelDefinition {
  readonly assetPath: string;
  readonly transform: {
    readonly scale: number;
    readonly rotationCorrectionRadians: {
      readonly x: number;
      readonly y: number;
      readonly z: number;
    };
    readonly positionOffset: {
      readonly x: number;
      readonly y: number;
      readonly z: number;
    };
  };
  readonly renderProfile: {
    readonly castShadow: boolean;
    readonly receiveShadow: boolean;
  };
}

const towerModelDefinitions: Partial<Record<TowerType, TowerModelDefinition>> = {
  [TowerType.BasicSpawner]: {
    assetPath: "/assets/models/spawners/spawner-ninja.glb",
    transform: {
      scale: 1.05,
      rotationCorrectionRadians: {
        x: 0,
        y: Math.PI * 0.5,
        z: 0
      },
      positionOffset: {
        x: 0,
        y: 0,
        z: 0
      }
    },
    renderProfile: {
      castShadow: true,
      receiveShadow: false
    }
  }
};

export const getTowerModelDefinition = (
  towerType: TowerType
): TowerModelDefinition | null => {
  return towerModelDefinitions[towerType] ?? null;
};

