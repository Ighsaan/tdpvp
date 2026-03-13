import * as THREE from "three";
import { BattlefieldState } from "@tdpvp/shared";
import {
  CAMERA_LERP_ALPHA,
  DEFAULT_CAMERA_LOOK_AT_HEIGHT,
  LANE_SPACING
} from "../../config/render-config.js";

/**
 * Maintains a fixed strategic camera framing for the lane battlefield.
 */
export class FixedGameplayCamera {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly lookAtCurrent = new THREE.Vector3();
  private readonly lookAtTarget = new THREE.Vector3();
  private readonly positionTarget = new THREE.Vector3();

  public constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.lookAtCurrent.set(0, DEFAULT_CAMERA_LOOK_AT_HEIGHT, 0);
    this.lookAtTarget.copy(this.lookAtCurrent);
    this.positionTarget.copy(this.camera.position);
  }

  public configureFromBattlefield(battlefield: BattlefieldState): void {
    const cameraHeight = Math.max(48, battlefield.laneCount * LANE_SPACING * 1.4);
    const cameraDepthOffset = battlefield.laneCount * LANE_SPACING * 1.55;

    this.positionTarget.set(0, cameraHeight, cameraDepthOffset);
    this.lookAtTarget.set(0, DEFAULT_CAMERA_LOOK_AT_HEIGHT, 0);
  }

  public tick(): void {
    this.camera.position.lerp(this.positionTarget, CAMERA_LERP_ALPHA);
    this.lookAtCurrent.lerp(this.lookAtTarget, CAMERA_LERP_ALPHA);
    this.camera.lookAt(this.lookAtCurrent);
  }
}
