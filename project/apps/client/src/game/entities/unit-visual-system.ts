import * as THREE from "three";
import { BattleRoomSnapshot, UnitType } from "@tdpvp/shared";
import { LANE_SPACING } from "../../config/render-config.js";
import { laneToWorldZ, serverXToWorldX } from "../../lib/world-mapping.js";
import { getUnitModelDefinition } from "./unit-model-registry.js";
import { UnitVisualController } from "./unit-visual-controller.js";
import { ModelAssetLoader } from "../rendering/model-asset-loader.js";

/**
 * Renders authoritative units with model-backed visuals or placeholder fallback.
 */
export class UnitVisualSystem {
  private readonly scene: THREE.Scene;
  private readonly modelAssetLoader = new ModelAssetLoader();
  private readonly unitVisuals = new Map<string, UnitVisualController>();
  private readonly activeUnitIdsScratch = new Set<string>();

  private readonly warnedMissingRegistryEntries = new Set<UnitType>();

  public constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public render(snapshot: BattleRoomSnapshot): void {
    this.activeUnitIdsScratch.clear();

    for (const lane of snapshot.battlefield.lanes) {
      const laneWorldZ = laneToWorldZ(
        lane.laneIndex,
        snapshot.battlefield.laneCount,
        LANE_SPACING
      );

      for (const unit of lane.units) {
        this.activeUnitIdsScratch.add(unit.unitId);

        const targetPositionX = serverXToWorldX(
          unit.positionX,
          snapshot.battlefield.laneLength
        );
        const targetPositionY = 0.8;
        const targetPositionZ = laneWorldZ;

        let visualController = this.unitVisuals.get(unit.unitId);
        if (!visualController) {
          const modelDefinition = getUnitModelDefinition(unit.unitType);
          if (!modelDefinition) {
            this.warnMissingRegistryEntry(unit.unitType);
          }

          visualController = new UnitVisualController({
            scene: this.scene,
            modelAssetLoader: this.modelAssetLoader,
            unitType: unit.unitType,
            ownerSide: unit.ownerSide,
            modelDefinition,
            initialPositionX: targetPositionX,
            initialPositionY: targetPositionY,
            initialPositionZ: targetPositionZ
          });
          this.unitVisuals.set(unit.unitId, visualController);
        }

        visualController.applyAuthoritativeState(
          unit,
          targetPositionX,
          targetPositionY,
          targetPositionZ
        );
      }
    }

    this.beginRemovalForMissingVisuals(this.activeUnitIdsScratch);
  }

  public tick(deltaSeconds: number): void {
    for (const [unitId, visualController] of this.unitVisuals.entries()) {
      visualController.tick(deltaSeconds);
      if (!visualController.readyForDisposal) {
        continue;
      }

      visualController.dispose();
      this.unitVisuals.delete(unitId);
    }
  }

  public dispose(): void {
    for (const visualController of this.unitVisuals.values()) {
      visualController.dispose();
    }
    this.unitVisuals.clear();
    this.activeUnitIdsScratch.clear();
  }

  public getModelPoolStats(): ReadonlyArray<{
    readonly assetPath: string;
    readonly poolSize: number;
    readonly cloneCount: number;
    readonly reusedFromPoolCount: number;
    readonly returnedToPoolCount: number;
    readonly droppedFromPoolCount: number;
  }> {
    return this.modelAssetLoader.getAssetPoolStats();
  }

  private beginRemovalForMissingVisuals(activeUnitIds: Set<string>): void {
    for (const [unitId, visualController] of this.unitVisuals.entries()) {
      if (activeUnitIds.has(unitId)) {
        continue;
      }

      visualController.beginRemoval();
    }
  }

  private warnMissingRegistryEntry(unitType: UnitType): void {
    if (this.warnedMissingRegistryEntries.has(unitType)) {
      return;
    }

    this.warnedMissingRegistryEntries.add(unitType);
    console.warn(
      `[UnitVisualSystem] No model registry entry for unit type "${unitType}". Using placeholder visuals.`
    );
  }
}
