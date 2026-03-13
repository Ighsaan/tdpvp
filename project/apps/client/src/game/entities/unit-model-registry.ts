import { UnitType } from "@tdpvp/shared";

export type InternalUnitAnimation =
  | "idle"
  | "walk"
  | "attackPrimary"
  | "attackSecondary"
  | "hitReact"
  | "death";

export type UnitAnimationTransitionKey =
  `${InternalUnitAnimation}->${InternalUnitAnimation}`;

export type UnitAnimationEventId = "windup" | "impact";

export interface UnitAnimationEventMarker {
  readonly eventId: UnitAnimationEventId;
  readonly normalizedTime: number;
}

export interface UnitAnimationBlendRules {
  readonly defaultTransitionSeconds: number;
  readonly hitReactCooldownSeconds: number;
  readonly transitionDurationsSeconds: Partial<
    Record<UnitAnimationTransitionKey, number>
  >;
  readonly priorities: Record<InternalUnitAnimation, number>;
}

interface UnitModelTransform {
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
}

interface UnitModelRenderProfile {
  readonly castShadow: boolean;
  readonly receiveShadow: boolean;
}

export interface UnitModelDefinition {
  readonly assetPath: string;
  readonly transform: UnitModelTransform;
  readonly renderProfile: UnitModelRenderProfile;
  readonly animationMap: Partial<Record<InternalUnitAnimation, string>>;
  readonly animationBlendRules: UnitAnimationBlendRules;
  readonly animationEvents: Partial<
    Record<InternalUnitAnimation, readonly UnitAnimationEventMarker[]>
  >;
}

const defaultAnimationBlendRules: UnitAnimationBlendRules = {
  defaultTransitionSeconds: 0.12,
  hitReactCooldownSeconds: 0.14,
  transitionDurationsSeconds: {
    "idle->walk": 0.2,
    "walk->idle": 0.18,
    "walk->attackPrimary": 0.08,
    "idle->attackPrimary": 0.08,
    "attackPrimary->walk": 0.1,
    "attackPrimary->idle": 0.1,
    "walk->hitReact": 0.06,
    "idle->hitReact": 0.06,
    "hitReact->walk": 0.08,
    "hitReact->idle": 0.08,
    "walk->death": 0.05,
    "idle->death": 0.05,
    "attackPrimary->death": 0.05
  },
  priorities: {
    idle: 0,
    walk: 10,
    attackPrimary: 40,
    attackSecondary: 35,
    hitReact: 55,
    death: 100
  }
};

const spawnNinjaAnimationMap: Partial<Record<InternalUnitAnimation, string>> = {
  walk: "Walk",
  attackPrimary: "Punch",
  attackSecondary: "Weapon",
  hitReact: "HitReact",
  death: "Death"
};

const spawnNinjaAnimationEvents: Partial<
  Record<InternalUnitAnimation, readonly UnitAnimationEventMarker[]>
> = {
  attackPrimary: [
    {
      eventId: "windup",
      normalizedTime: 0.22
    },
    {
      eventId: "impact",
      normalizedTime: 0.47
    }
  ],
  attackSecondary: [
    {
      eventId: "windup",
      normalizedTime: 0.26
    },
    {
      eventId: "impact",
      normalizedTime: 0.58
    }
  ]
};

const unitModelDefinitions: Partial<Record<UnitType, UnitModelDefinition>> = {
  [UnitType.BasicSoldier]: {
    assetPath: "/assets/models/units/spawn-ninja.glb",
    transform: {
      scale: 0.9,
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
    },
    animationMap: spawnNinjaAnimationMap,
    animationBlendRules: defaultAnimationBlendRules,
    animationEvents: spawnNinjaAnimationEvents
  },
  [UnitType.FastSoldier]: {
    assetPath: "/assets/models/units/spawn-ninja.glb",
    transform: {
      scale: 0.78,
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
    },
    animationMap: spawnNinjaAnimationMap,
    animationBlendRules: defaultAnimationBlendRules,
    animationEvents: spawnNinjaAnimationEvents
  }
};

export const getUnitModelDefinition = (
  unitType: UnitType
): UnitModelDefinition | null => {
  return unitModelDefinitions[unitType] ?? null;
};

