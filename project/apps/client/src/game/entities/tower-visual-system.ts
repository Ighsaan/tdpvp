import * as THREE from "three";
import { BattleRoomSnapshot, PlayerSide, TowerType } from "@tdpvp/shared";
import { LANE_SPACING } from "../../config/render-config.js";
import { laneToWorldZ, serverXToWorldX } from "../../lib/world-mapping.js";
import { ModelAssetLoader } from "../rendering/model-asset-loader.js";
import {
  TowerModelDefinition,
  getTowerModelDefinition
} from "./tower-model-registry.js";

const towerColor = (side: PlayerSide): number => {
  if (side === PlayerSide.Left) {
    return 0x4ccf7a;
  }
  return 0x62a7ff;
};

interface TowerVisual {
  readonly root: THREE.Group;
  readonly modelDefinition: TowerModelDefinition | null;
  placeholderMesh: THREE.Mesh | null;
  modelRoot: THREE.Object3D | null;
  modelAssetPath: string | null;
}

/**
 * Renders tower visuals keyed by authoritative tower ids.
 */
export class TowerVisualSystem {
  private readonly scene: THREE.Scene;
  private readonly modelAssetLoader = new ModelAssetLoader();
  private readonly towerVisuals = new Map<string, TowerVisual>();

  private readonly warnedMissingRegistryEntries = new Set<TowerType>();
  private readonly warnedModelLoadFailures = new Set<string>();

  public constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public render(snapshot: BattleRoomSnapshot): void {
    const activeTowerIds = new Set<string>();

    for (const lane of snapshot.battlefield.lanes) {
      const laneWorldZ = laneToWorldZ(
        lane.laneIndex,
        snapshot.battlefield.laneCount,
        LANE_SPACING
      );

      for (const tower of lane.towers) {
        activeTowerIds.add(tower.towerId);

        let visual = this.towerVisuals.get(tower.towerId);
        if (!visual) {
          visual = this.createTowerVisual(
            tower.towerId,
            tower.towerType,
            tower.ownerSide
          );
          this.towerVisuals.set(tower.towerId, visual);
        }

        visual.root.position.set(
          serverXToWorldX(tower.positionX, snapshot.battlefield.laneLength),
          0,
          laneWorldZ
        );
      }
    }

    this.removeMissingVisuals(activeTowerIds);
  }

  public dispose(): void {
    for (const visual of this.towerVisuals.values()) {
      this.disposeTowerVisual(visual);
    }
    this.towerVisuals.clear();
  }

  private createTowerVisual(
    towerId: string,
    towerType: TowerType,
    ownerSide: PlayerSide
  ): TowerVisual {
    const modelDefinition = getTowerModelDefinition(towerType);
    if (!modelDefinition) {
      this.warnMissingRegistryEntry(towerType);
    }

    const root = new THREE.Group();
    const placeholderMesh = this.createPlaceholderMesh(ownerSide);
    root.add(placeholderMesh);
    this.scene.add(root);

    const visual: TowerVisual = {
      root,
      modelDefinition,
      placeholderMesh,
      modelRoot: null,
      modelAssetPath: null
    };

    if (modelDefinition) {
      void this.attachModelVisual(towerId, visual, modelDefinition);
    }

    return visual;
  }

  private async attachModelVisual(
    towerId: string,
    visual: TowerVisual,
    modelDefinition: TowerModelDefinition
  ): Promise<void> {
    try {
      const modelInstance = await this.modelAssetLoader.createModelInstance(
        modelDefinition.assetPath
      );

      const activeVisual = this.towerVisuals.get(towerId);
      if (!activeVisual || activeVisual !== visual) {
        this.modelAssetLoader.releaseModelInstance(
          modelDefinition.assetPath,
          modelInstance.root
        );
        return;
      }

      visual.modelRoot = modelInstance.root;
      visual.modelAssetPath = modelDefinition.assetPath;

      modelInstance.root.position.set(
        modelDefinition.transform.positionOffset.x,
        modelDefinition.transform.positionOffset.y,
        modelDefinition.transform.positionOffset.z
      );
      modelInstance.root.rotation.set(
        modelDefinition.transform.rotationCorrectionRadians.x,
        modelDefinition.transform.rotationCorrectionRadians.y,
        modelDefinition.transform.rotationCorrectionRadians.z
      );
      modelInstance.root.scale.setScalar(modelDefinition.transform.scale);
      this.configureModelRenderProfile(modelInstance.root, modelDefinition);
      visual.root.add(modelInstance.root);

      if (visual.placeholderMesh) {
        visual.root.remove(visual.placeholderMesh);
        visual.placeholderMesh.geometry.dispose();
        (visual.placeholderMesh.material as THREE.Material).dispose();
        visual.placeholderMesh = null;
      }
    } catch (error: unknown) {
      if (!this.warnedModelLoadFailures.has(modelDefinition.assetPath)) {
        this.warnedModelLoadFailures.add(modelDefinition.assetPath);
        console.warn(
          `[TowerVisualSystem] Failed to load tower model "${modelDefinition.assetPath}". Using placeholder visual.`,
          error
        );
      }
    }
  }

  private removeMissingVisuals(activeTowerIds: Set<string>): void {
    for (const [towerId, visual] of this.towerVisuals.entries()) {
      if (activeTowerIds.has(towerId)) {
        continue;
      }

      this.disposeTowerVisual(visual);
      this.towerVisuals.delete(towerId);
    }
  }

  private disposeTowerVisual(visual: TowerVisual): void {
    if (visual.modelRoot && visual.modelAssetPath) {
      visual.root.remove(visual.modelRoot);
      this.modelAssetLoader.releaseModelInstance(
        visual.modelAssetPath,
        visual.modelRoot
      );
      visual.modelRoot = null;
      visual.modelAssetPath = null;
    }

    if (visual.placeholderMesh) {
      visual.root.remove(visual.placeholderMesh);
      visual.placeholderMesh.geometry.dispose();
      (visual.placeholderMesh.material as THREE.Material).dispose();
      visual.placeholderMesh = null;
    }

    this.scene.remove(visual.root);
  }

  private warnMissingRegistryEntry(towerType: TowerType): void {
    if (this.warnedMissingRegistryEntries.has(towerType)) {
      return;
    }

    this.warnedMissingRegistryEntries.add(towerType);
    console.warn(
      `[TowerVisualSystem] No model registry entry for tower type "${towerType}". Using placeholder visuals.`
    );
  }

  private configureModelRenderProfile(
    root: THREE.Object3D,
    modelDefinition: TowerModelDefinition
  ): void {
    root.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = modelDefinition.renderProfile.castShadow;
        node.receiveShadow = modelDefinition.renderProfile.receiveShadow;
        node.frustumCulled = true;
      }
    });
  }

  private createPlaceholderMesh(side: PlayerSide): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.4, 1.6),
      new THREE.MeshStandardMaterial({
        color: towerColor(side),
        roughness: 0.62,
        metalness: 0.18
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 1.7;
    return mesh;
  }
}
