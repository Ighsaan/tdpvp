import * as THREE from "three";
import { PlayerSide, UnitState, UnitType } from "@tdpvp/shared";
import {
  UNIT_POSITION_INTERPOLATION_SPEED,
  UNIT_POSITION_SNAP_DISTANCE
} from "../../config/render-config.js";
import {
  InternalUnitAnimation,
  UnitAnimationBlendRules,
  UnitAnimationEventId,
  UnitAnimationEventMarker,
  UnitModelDefinition
} from "./unit-model-registry.js";
import { ModelAssetLoader } from "../rendering/model-asset-loader.js";

const placeholderColor = (side: PlayerSide): number => {
  if (side === PlayerSide.Left) {
    return 0x94ffb9;
  }
  return 0xa7d1ff;
};

const oneShotAnimations = new Set<InternalUnitAnimation>([
  "attackPrimary",
  "attackSecondary",
  "hitReact",
  "death"
]);

const fallbackAnimationBlendRules: UnitAnimationBlendRules = {
  defaultTransitionSeconds: 0.12,
  hitReactCooldownSeconds: 0.14,
  transitionDurationsSeconds: {},
  priorities: {
    idle: 0,
    walk: 10,
    attackPrimary: 40,
    attackSecondary: 35,
    hitReact: 55,
    death: 100
  }
};

const impactPulseDurationSeconds = 0.12;
const impactPulseScaleMagnitude = 0.08;

const isOneShotAnimation = (animation: InternalUnitAnimation): boolean => {
  return oneShotAnimations.has(animation);
};

interface UnitVisualControllerOptions {
  readonly scene: THREE.Scene;
  readonly modelAssetLoader: ModelAssetLoader;
  readonly unitType: UnitType;
  readonly ownerSide: PlayerSide;
  readonly modelDefinition: UnitModelDefinition | null;
  readonly initialPositionX: number;
  readonly initialPositionY: number;
  readonly initialPositionZ: number;
}

/**
 * Purely visual unit controller with optional GLB model + animation support.
 */
export class UnitVisualController {
  private readonly scene: THREE.Scene;
  private readonly modelAssetLoader: ModelAssetLoader;
  private readonly unitType: UnitType;
  private readonly ownerSide: PlayerSide;
  private readonly modelDefinition: UnitModelDefinition | null;
  private readonly blendRules: UnitAnimationBlendRules;

  private readonly root = new THREE.Group();
  private readonly targetPosition = new THREE.Vector3();
  private readonly placeholderMesh: THREE.Mesh;
  private readonly animationMixer: THREE.AnimationMixer;

  private modelRoot: THREE.Object3D | null = null;
  private modelAssetPath: string | null = null;
  private readonly animationActions = new Map<
    InternalUnitAnimation,
    THREE.AnimationAction
  >();

  private activeLoopAction: THREE.AnimationAction | null = null;
  private activeLoopAnimation: InternalUnitAnimation | null = null;
  private usingIdleFallbackOnWalk = false;
  private activeOneShotAnimation: InternalUnitAnimation | null = null;

  private activeOneShotMarkers: readonly UnitAnimationEventMarker[] = [];
  private readonly firedOneShotMarkerIndices = new Set<number>();

  private lastAuthoritativePositionX: number | null = null;
  private lastAttackCooldownRemainingTicks: number | null = null;
  private lastKnownHp: number | null = null;

  private movingAuthoritatively = false;

  private pendingRemoval = false;
  private pendingRemovalDurationSeconds = 0;
  private pendingRemovalElapsedSeconds = 0;
  private isDisposed = false;
  private isPlaceholderAttached = true;

  private hitReactCooldownRemainingSeconds = 0;
  private impactPulseRemainingSeconds = 0;

  private placeholderBaseScale = 1;
  private modelBaseScale = 1;

  private static readonly warnedMissingClips = new Set<string>();
  private static readonly warnedModelFallbacks = new Set<string>();

  public constructor(options: UnitVisualControllerOptions) {
    this.scene = options.scene;
    this.modelAssetLoader = options.modelAssetLoader;
    this.unitType = options.unitType;
    this.ownerSide = options.ownerSide;
    this.modelDefinition = options.modelDefinition;
    this.blendRules =
      options.modelDefinition?.animationBlendRules ?? fallbackAnimationBlendRules;

    this.placeholderMesh = this.createPlaceholderMesh(options.ownerSide);
    this.root.add(this.placeholderMesh);
    this.animationMixer = new THREE.AnimationMixer(this.root);

    this.targetPosition.set(
      options.initialPositionX,
      options.initialPositionY,
      options.initialPositionZ
    );
    this.root.position.copy(this.targetPosition);
    this.applyFacingDirection(
      options.ownerSide === PlayerSide.Left ? 1 : -1
    );

    this.scene.add(this.root);

    if (this.modelDefinition) {
      void this.attachModelVisual(this.modelDefinition);
    }
  }

  public applyAuthoritativeState(
    unit: UnitState,
    targetPositionX: number,
    targetPositionY: number,
    targetPositionZ: number
  ): void {
    if (this.isDisposed) {
      return;
    }

    if (this.pendingRemoval) {
      this.pendingRemoval = false;
      this.pendingRemovalDurationSeconds = 0;
      this.pendingRemovalElapsedSeconds = 0;
    }

    this.targetPosition.set(targetPositionX, targetPositionY, targetPositionZ);
    if (
      this.root.position.distanceToSquared(this.targetPosition) >
      UNIT_POSITION_SNAP_DISTANCE * UNIT_POSITION_SNAP_DISTANCE
    ) {
      this.root.position.copy(this.targetPosition);
    }

    const previousPositionX = this.lastAuthoritativePositionX;
    this.lastAuthoritativePositionX = unit.positionX;

    this.movingAuthoritatively =
      previousPositionX !== null &&
      Math.abs(unit.positionX - previousPositionX) > 0.0001;

    const movementDirectionX =
      previousPositionX === null
        ? this.ownerSide === PlayerSide.Left
          ? 1
          : -1
        : Math.sign(unit.positionX - previousPositionX);

    if (movementDirectionX !== 0) {
      this.applyFacingDirection(movementDirectionX);
    }

    const hpRatio = Math.max(0.18, unit.hp / unit.maxHp);
    this.placeholderBaseScale = 0.65 + hpRatio * 0.55;

    const triggeredPrimaryAttack = this.detectPrimaryAttackTrigger(unit);
    if (triggeredPrimaryAttack) {
      this.requestOneShotAnimation("attackPrimary");
    }

    const triggeredHitReact = this.detectHitReactTrigger(unit);
    if (triggeredHitReact) {
      this.requestOneShotAnimation("hitReact");
    }

    if (!this.activeOneShotAnimation) {
      this.applyLocomotionAnimation();
    }

    this.applyCurrentVisualScales();
  }

  public tick(deltaSeconds: number): void {
    if (this.isDisposed) {
      return;
    }

    if (!this.pendingRemoval) {
      const alpha = 1 - Math.exp(-UNIT_POSITION_INTERPOLATION_SPEED * deltaSeconds);
      this.root.position.lerp(this.targetPosition, alpha);
    } else {
      this.pendingRemovalElapsedSeconds += deltaSeconds;
    }

    if (this.hitReactCooldownRemainingSeconds > 0) {
      this.hitReactCooldownRemainingSeconds = Math.max(
        0,
        this.hitReactCooldownRemainingSeconds - deltaSeconds
      );
    }

    if (this.impactPulseRemainingSeconds > 0) {
      this.impactPulseRemainingSeconds = Math.max(
        0,
        this.impactPulseRemainingSeconds - deltaSeconds
      );
    }

    this.animationMixer.update(deltaSeconds);
    this.processOneShotAnimationEvents();

    if (!this.activeOneShotAnimation || this.activeOneShotAnimation === "death") {
      this.applyCurrentVisualScales();
      return;
    }

    const activeAction = this.animationActions.get(this.activeOneShotAnimation);
    if (activeAction && !activeAction.isRunning()) {
      this.activeOneShotAnimation = null;
      this.activeOneShotMarkers = [];
      this.firedOneShotMarkerIndices.clear();
      this.applyLocomotionAnimation();
    }

    this.applyCurrentVisualScales();
  }

  public beginRemoval(): void {
    if (this.pendingRemoval || this.isDisposed) {
      return;
    }

    this.pendingRemoval = true;
    this.pendingRemovalElapsedSeconds = 0;
    this.targetPosition.copy(this.root.position);

    const didPlayDeath = this.requestOneShotAnimation("death");
    if (didPlayDeath) {
      const deathAction = this.animationActions.get("death");
      this.pendingRemovalDurationSeconds = Math.max(
        0.28,
        deathAction?.getClip().duration ?? 0.5
      );
      return;
    }

    this.pendingRemovalDurationSeconds = 0;
  }

  public get readyForDisposal(): boolean {
    return (
      this.pendingRemoval &&
      this.pendingRemovalElapsedSeconds >= this.pendingRemovalDurationSeconds
    );
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    this.animationMixer.stopAllAction();
    this.animationMixer.uncacheRoot(this.root);

    if (this.modelRoot && this.modelAssetPath) {
      this.root.remove(this.modelRoot);
      this.modelAssetLoader.releaseModelInstance(this.modelAssetPath, this.modelRoot);
    }

    if (this.isPlaceholderAttached) {
      this.disposePlaceholderMesh();
    }

    this.scene.remove(this.root);
    this.animationActions.clear();
    this.modelRoot = null;
    this.modelAssetPath = null;
    this.activeOneShotMarkers = [];
    this.firedOneShotMarkerIndices.clear();
  }

  private async attachModelVisual(modelDefinition: UnitModelDefinition): Promise<void> {
    try {
      const modelInstance = await this.modelAssetLoader.createModelInstance(
        modelDefinition.assetPath
      );

      if (this.isDisposed || this.pendingRemoval) {
        this.modelAssetLoader.releaseModelInstance(
          modelDefinition.assetPath,
          modelInstance.root
        );
        return;
      }

      this.modelRoot = modelInstance.root;
      this.modelAssetPath = modelDefinition.assetPath;
      this.modelBaseScale = modelDefinition.transform.scale;

      this.modelRoot.position.set(
        modelDefinition.transform.positionOffset.x,
        modelDefinition.transform.positionOffset.y,
        modelDefinition.transform.positionOffset.z
      );
      this.modelRoot.rotation.set(
        modelDefinition.transform.rotationCorrectionRadians.x,
        modelDefinition.transform.rotationCorrectionRadians.y,
        modelDefinition.transform.rotationCorrectionRadians.z
      );
      this.modelRoot.scale.setScalar(this.modelBaseScale);
      this.configureModelRenderProfile(this.modelRoot, modelDefinition);
      this.root.add(this.modelRoot);

      this.bindAnimationActions(modelDefinition, modelInstance.clips);

      this.root.remove(this.placeholderMesh);
      this.disposePlaceholderMesh();
      this.isPlaceholderAttached = false;

      if (!this.activeOneShotAnimation) {
        this.applyLocomotionAnimation();
      }
    } catch (_error: unknown) {
      const warningKey = `${this.unitType}`;
      if (!UnitVisualController.warnedModelFallbacks.has(warningKey)) {
        UnitVisualController.warnedModelFallbacks.add(warningKey);
        console.warn(
          `[UnitVisualController] Unit type "${this.unitType}" is using placeholder visuals because model "${modelDefinition.assetPath}" failed to load.`
        );
      }
    }
  }

  private bindAnimationActions(
    modelDefinition: UnitModelDefinition,
    clips: readonly THREE.AnimationClip[]
  ): void {
    const animationEntries = Object.entries(modelDefinition.animationMap) as Array<
      [InternalUnitAnimation, string]
    >;

    for (const [internalAnimation, sourceClipName] of animationEntries) {
      const clip = this.findClipBySourceName(clips, sourceClipName);
      if (!clip) {
        this.warnMissingClip(
          modelDefinition.assetPath,
          sourceClipName,
          internalAnimation
        );
        continue;
      }

      const action = this.animationMixer.clipAction(clip);
      if (isOneShotAnimation(internalAnimation)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      }

      this.animationActions.set(internalAnimation, action);
    }
  }

  private applyLocomotionAnimation(): void {
    const desiredAnimation: InternalUnitAnimation = this.movingAuthoritatively
      ? "walk"
      : "idle";

    if (desiredAnimation === "walk") {
      const walkAction = this.animationActions.get("walk");
      if (!walkAction) {
        return;
      }
      this.activateLoopAction("walk", walkAction, false);
      return;
    }

    const idleAction = this.animationActions.get("idle");
    if (idleAction) {
      this.activateLoopAction("idle", idleAction, false);
      return;
    }

    const fallbackWalkAction = this.animationActions.get("walk");
    if (!fallbackWalkAction) {
      return;
    }

    this.activateLoopAction("idle", fallbackWalkAction, true);
  }

  private activateLoopAction(
    animation: InternalUnitAnimation,
    action: THREE.AnimationAction,
    idleFallbackOnWalk: boolean
  ): void {
    const isSameLoopAction =
      this.activeLoopAction === action &&
      this.activeLoopAnimation === animation &&
      this.usingIdleFallbackOnWalk === idleFallbackOnWalk;

    const transitionSeconds = this.resolveTransitionSeconds(
      this.getCurrentAnimation(),
      animation
    );

    if (!isSameLoopAction) {
      if (this.activeLoopAction && this.activeLoopAction !== action) {
        this.activeLoopAction.fadeOut(transitionSeconds);
      }

      if (this.activeLoopAction !== action) {
        action.reset();
        action.fadeIn(transitionSeconds);
      }

      action.play();
      this.activeLoopAction = action;
      this.activeLoopAnimation = animation;
      this.usingIdleFallbackOnWalk = idleFallbackOnWalk;
    }

    if (idleFallbackOnWalk) {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.setEffectiveTimeScale(0);
      action.paused = true;
      action.time = 0;
      return;
    }

    action.setLoop(THREE.LoopRepeat, Infinity);
    action.paused = false;
    action.setEffectiveTimeScale(1);
  }

  private requestOneShotAnimation(animation: InternalUnitAnimation): boolean {
    const action = this.animationActions.get(animation);
    if (!action || !isOneShotAnimation(animation)) {
      return false;
    }

    if (this.activeOneShotAnimation === "death" && animation !== "death") {
      return false;
    }

    if (this.activeOneShotAnimation) {
      if (this.activeOneShotAnimation === animation) {
        const currentAction = this.animationActions.get(animation);
        if (currentAction?.isRunning()) {
          return false;
        }
      }

      const incomingPriority = this.blendRules.priorities[animation];
      const activePriority = this.blendRules.priorities[this.activeOneShotAnimation];
      if (incomingPriority < activePriority) {
        return false;
      }
    }

    return this.playOneShotAnimation(animation, action);
  }

  private playOneShotAnimation(
    animation: InternalUnitAnimation,
    action: THREE.AnimationAction
  ): boolean {
    const transitionSeconds = this.resolveTransitionSeconds(
      this.getCurrentAnimation(),
      animation
    );

    if (this.activeLoopAction) {
      this.activeLoopAction.fadeOut(transitionSeconds);
    }

    if (
      this.activeOneShotAnimation &&
      this.activeOneShotAnimation !== animation
    ) {
      const currentOneShotAction = this.animationActions.get(this.activeOneShotAnimation);
      currentOneShotAction?.fadeOut(transitionSeconds);
    }

    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.paused = false;
    action.setEffectiveTimeScale(1);
    action.fadeIn(transitionSeconds);
    action.play();

    this.activeOneShotAnimation = animation;
    this.activeOneShotMarkers =
      this.modelDefinition?.animationEvents[animation] ?? [];
    this.firedOneShotMarkerIndices.clear();
    return true;
  }

  private detectPrimaryAttackTrigger(unit: UnitState): boolean {
    const previousCooldownRemainingTicks = this.lastAttackCooldownRemainingTicks;
    this.lastAttackCooldownRemainingTicks = unit.attackCooldownRemainingTicks;

    if (previousCooldownRemainingTicks === null || unit.targetUnitId === null) {
      return false;
    }

    return unit.attackCooldownRemainingTicks > previousCooldownRemainingTicks;
  }

  private detectHitReactTrigger(unit: UnitState): boolean {
    const previousHp = this.lastKnownHp;
    this.lastKnownHp = unit.hp;

    if (previousHp === null) {
      return false;
    }

    const didTakeDamage = unit.hp < previousHp;
    if (!didTakeDamage) {
      return false;
    }

    if (this.hitReactCooldownRemainingSeconds > 0) {
      return false;
    }

    this.hitReactCooldownRemainingSeconds = this.blendRules.hitReactCooldownSeconds;
    return true;
  }

  private processOneShotAnimationEvents(): void {
    if (
      !this.activeOneShotAnimation ||
      this.activeOneShotMarkers.length === 0
    ) {
      return;
    }

    const action = this.animationActions.get(this.activeOneShotAnimation);
    if (!action) {
      return;
    }

    const clipDuration = action.getClip().duration;
    if (clipDuration <= 0) {
      return;
    }

    const normalizedTime = THREE.MathUtils.clamp(action.time / clipDuration, 0, 1);

    for (let markerIndex = 0; markerIndex < this.activeOneShotMarkers.length; markerIndex += 1) {
      if (this.firedOneShotMarkerIndices.has(markerIndex)) {
        continue;
      }

      const marker = this.activeOneShotMarkers[markerIndex];
      if (!marker) {
        continue;
      }

      if (normalizedTime < marker.normalizedTime) {
        continue;
      }

      this.firedOneShotMarkerIndices.add(markerIndex);
      this.handleAnimationEvent(marker.eventId);
    }
  }

  private handleAnimationEvent(eventId: UnitAnimationEventId): void {
    if (eventId === "impact") {
      this.impactPulseRemainingSeconds = impactPulseDurationSeconds;
    }
  }

  private resolveTransitionSeconds(
    fromAnimation: InternalUnitAnimation | null,
    toAnimation: InternalUnitAnimation
  ): number {
    if (!fromAnimation) {
      return this.blendRules.defaultTransitionSeconds;
    }

    const transitionKey = `${fromAnimation}->${toAnimation}` as const;
    return (
      this.blendRules.transitionDurationsSeconds[transitionKey] ??
      this.blendRules.defaultTransitionSeconds
    );
  }

  private getCurrentAnimation(): InternalUnitAnimation | null {
    if (this.activeOneShotAnimation) {
      return this.activeOneShotAnimation;
    }
    return this.activeLoopAnimation;
  }

  private createPlaceholderMesh(side: PlayerSide): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 18, 14),
      new THREE.MeshStandardMaterial({
        color: placeholderColor(side),
        roughness: 0.45,
        metalness: 0.18
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private disposePlaceholderMesh(): void {
    this.placeholderMesh.geometry.dispose();
    (this.placeholderMesh.material as THREE.Material).dispose();
  }

  private applyFacingDirection(directionX: number): void {
    this.root.rotation.y = directionX >= 0 ? 0 : Math.PI;
  }

  private configureModelRenderProfile(
    root: THREE.Object3D,
    modelDefinition: UnitModelDefinition
  ): void {
    root.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = modelDefinition.renderProfile.castShadow;
        node.receiveShadow = modelDefinition.renderProfile.receiveShadow;
        node.frustumCulled = true;
      }
    });
  }

  private applyCurrentVisualScales(): void {
    const pulseProgress =
      this.impactPulseRemainingSeconds <= 0
        ? 0
        : 1 - this.impactPulseRemainingSeconds / impactPulseDurationSeconds;
    const pulseScaleMultiplier =
      this.impactPulseRemainingSeconds <= 0
        ? 1
        : 1 + Math.sin(pulseProgress * Math.PI) * impactPulseScaleMagnitude;

    if (this.isPlaceholderAttached) {
      this.placeholderMesh.scale.setScalar(
        this.placeholderBaseScale * pulseScaleMultiplier
      );
      return;
    }

    if (this.modelRoot) {
      this.modelRoot.scale.setScalar(this.modelBaseScale * pulseScaleMultiplier);
    }
  }

  private warnMissingClip(
    assetPath: string,
    sourceClipName: string,
    internalAnimation: InternalUnitAnimation
  ): void {
    const warningKey = `${assetPath}:${internalAnimation}:${sourceClipName}`;
    if (UnitVisualController.warnedMissingClips.has(warningKey)) {
      return;
    }

    UnitVisualController.warnedMissingClips.add(warningKey);
    console.warn(
      `[UnitVisualController] Missing clip "${sourceClipName}" for "${internalAnimation}" in asset "${assetPath}".`
    );
  }

  private findClipBySourceName(
    clips: readonly THREE.AnimationClip[],
    sourceClipName: string
  ): THREE.AnimationClip | null {
    const exactMatch = clips.find((candidate) => candidate.name === sourceClipName);
    if (exactMatch) {
      return exactMatch;
    }

    const sourceClipLower = sourceClipName.toLowerCase();

    const normalizedMatch = clips.find((candidate) => {
      const candidateParts = candidate.name.split("|");
      const candidateSuffix = candidateParts[candidateParts.length - 1];
      return (
        candidateSuffix?.toLowerCase() === sourceClipLower ||
        candidate.name.toLowerCase() === sourceClipLower
      );
    });

    if (normalizedMatch) {
      return normalizedMatch;
    }

    return null;
  }
}
