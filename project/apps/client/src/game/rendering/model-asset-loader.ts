import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinnedObject } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface ModelAssetInstance {
  readonly root: THREE.Object3D;
  readonly clips: readonly THREE.AnimationClip[];
}

interface ModelAssetPoolStats {
  cloneCount: number;
  reusedFromPoolCount: number;
  returnedToPoolCount: number;
  droppedFromPoolCount: number;
}

interface CachedModelAsset {
  readonly scene: THREE.Object3D;
  readonly clips: readonly THREE.AnimationClip[];
}

/**
 * Loads and caches GLB model assets by path, then returns cloned instances.
 */
export class ModelAssetLoader {
  private readonly gltfLoader = new GLTFLoader();
  private readonly cachedAssets = new Map<string, Promise<CachedModelAsset>>();
  private readonly pooledInstances = new Map<string, THREE.Object3D[]>();
  private readonly poolStatsByAssetPath = new Map<string, ModelAssetPoolStats>();

  private static readonly warnedLoadFailures = new Set<string>();
  private static readonly maxPooledInstancesPerAsset = 48;

  public async createModelInstance(assetPath: string): Promise<ModelAssetInstance> {
    const cachedAsset = await this.loadAsset(assetPath);
    const pooledInstance = this.acquireFromPool(assetPath);
    if (pooledInstance) {
      this.ensurePoolStats(assetPath).reusedFromPoolCount += 1;
      return {
        root: pooledInstance,
        clips: cachedAsset.clips
      };
    }

    this.ensurePoolStats(assetPath).cloneCount += 1;
    return {
      root: cloneSkinnedObject(cachedAsset.scene),
      clips: cachedAsset.clips
    };
  }

  public releaseModelInstance(assetPath: string, root: THREE.Object3D): void {
    root.parent?.remove(root);
    this.resetModelInstance(root);

    const pooledInstances = this.ensurePool(assetPath);
    const stats = this.ensurePoolStats(assetPath);

    if (pooledInstances.length >= ModelAssetLoader.maxPooledInstancesPerAsset) {
      stats.droppedFromPoolCount += 1;
      return;
    }

    pooledInstances.push(root);
    stats.returnedToPoolCount += 1;
  }

  public getAssetPoolStats(): ReadonlyArray<{
    readonly assetPath: string;
    readonly poolSize: number;
    readonly cloneCount: number;
    readonly reusedFromPoolCount: number;
    readonly returnedToPoolCount: number;
    readonly droppedFromPoolCount: number;
  }> {
    return Array.from(this.poolStatsByAssetPath.entries()).map(
      ([assetPath, stats]) => ({
        assetPath,
        poolSize: this.pooledInstances.get(assetPath)?.length ?? 0,
        cloneCount: stats.cloneCount,
        reusedFromPoolCount: stats.reusedFromPoolCount,
        returnedToPoolCount: stats.returnedToPoolCount,
        droppedFromPoolCount: stats.droppedFromPoolCount
      })
    );
  }

  private async loadAsset(assetPath: string): Promise<CachedModelAsset> {
    let cachedAsset = this.cachedAssets.get(assetPath);
    if (!cachedAsset) {
      cachedAsset = this.gltfLoader
        .loadAsync(assetPath)
        .then((gltf) => ({
          scene: gltf.scene,
          clips: gltf.animations
        }))
        .catch((error: unknown) => {
          this.cachedAssets.delete(assetPath);
          if (!ModelAssetLoader.warnedLoadFailures.has(assetPath)) {
            ModelAssetLoader.warnedLoadFailures.add(assetPath);
            console.warn(
              `[ModelAssetLoader] Failed to load "${assetPath}". Falling back to placeholder visuals.`,
              error
            );
          }
          throw error;
        });
      this.cachedAssets.set(assetPath, cachedAsset);
    }

    return cachedAsset;
  }

  private acquireFromPool(assetPath: string): THREE.Object3D | null {
    const pooledInstances = this.pooledInstances.get(assetPath);
    if (!pooledInstances || pooledInstances.length === 0) {
      return null;
    }

    return pooledInstances.pop() ?? null;
  }

  private ensurePool(assetPath: string): THREE.Object3D[] {
    let pooledInstances = this.pooledInstances.get(assetPath);
    if (!pooledInstances) {
      pooledInstances = [];
      this.pooledInstances.set(assetPath, pooledInstances);
    }
    return pooledInstances;
  }

  private ensurePoolStats(assetPath: string): ModelAssetPoolStats {
    let stats = this.poolStatsByAssetPath.get(assetPath);
    if (!stats) {
      stats = {
        cloneCount: 0,
        reusedFromPoolCount: 0,
        returnedToPoolCount: 0,
        droppedFromPoolCount: 0
      };
      this.poolStatsByAssetPath.set(assetPath, stats);
    }
    return stats;
  }

  private resetModelInstance(root: THREE.Object3D): void {
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    root.scale.set(1, 1, 1);
    root.visible = true;

    root.traverse((node) => {
      node.visible = true;
      if (node instanceof THREE.SkinnedMesh) {
        node.skeleton.pose();
      }
    });
  }
}
