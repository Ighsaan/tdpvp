import * as THREE from "three";
import { BattleRoomSnapshot } from "@tdpvp/shared";
import {
  BATTLEFIELD_BACKGROUND_COLOR,
  BATTLEFIELD_FOG_FAR,
  BATTLEFIELD_FOG_NEAR,
  LANE_SPACING,
  WORLD_MARGIN
} from "../../config/render-config.js";
import { laneToWorldZ } from "../../lib/world-mapping.js";
import { FixedGameplayCamera } from "../camera/fixed-gameplay-camera.js";
import { BaseVisualSystem } from "../entities/base-visual-system.js";
import { TowerVisualSystem } from "../entities/tower-visual-system.js";
import { UnitVisualSystem } from "../entities/unit-visual-system.js";
import { BattlefieldStaticRenderer } from "./battlefield-static-renderer.js";

/**
 * ThreeJS scene host for authoritative battlefield rendering.
 */
export class ThreeBattlefieldScene {
  private readonly viewportElement: HTMLElement;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly fixedCamera: FixedGameplayCamera;

  private readonly staticRenderer: BattlefieldStaticRenderer;
  private readonly baseVisualSystem: BaseVisualSystem;
  private readonly towerVisualSystem: TowerVisualSystem;
  private readonly unitVisualSystem: UnitVisualSystem;
  private readonly selectedLaneMesh: THREE.Mesh;
  private readonly clock = new THREE.Clock();

  private animationFrameId = 0;

  private readonly onWindowResize = (): void => {
    this.resizeRenderer();
  };

  private readonly animate = (): void => {
    this.animationFrameId = window.requestAnimationFrame(this.animate);
    const deltaSeconds = this.clock.getDelta();
    this.fixedCamera.tick();
    this.unitVisualSystem.tick(deltaSeconds);
    this.renderer.render(this.scene, this.camera);
  };

  public constructor(viewportElement: HTMLElement) {
    this.viewportElement = viewportElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BATTLEFIELD_BACKGROUND_COLOR);
    this.scene.fog = new THREE.Fog(
      BATTLEFIELD_BACKGROUND_COLOR,
      BATTLEFIELD_FOG_NEAR,
      BATTLEFIELD_FOG_FAR
    );

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
    this.camera.position.set(0, 54, 74);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.viewportElement.append(this.renderer.domElement);

    this.fixedCamera = new FixedGameplayCamera(this.camera);
    this.staticRenderer = new BattlefieldStaticRenderer(this.scene);
    this.baseVisualSystem = new BaseVisualSystem(this.scene);
    this.towerVisualSystem = new TowerVisualSystem(this.scene);
    this.unitVisualSystem = new UnitVisualSystem(this.scene);

    this.selectedLaneMesh = this.createSelectedLaneMesh();
    this.scene.add(this.selectedLaneMesh);

    this.configureLighting();
    this.resizeRenderer();
    window.addEventListener("resize", this.onWindowResize);
    this.animationFrameId = window.requestAnimationFrame(this.animate);
  }

  public renderSnapshot(
    snapshot: BattleRoomSnapshot,
    selectedLaneIndex: number
  ): void {
    const safeLaneIndex =
      ((selectedLaneIndex % snapshot.battlefield.laneCount) +
        snapshot.battlefield.laneCount) %
      snapshot.battlefield.laneCount;

    this.fixedCamera.configureFromBattlefield(snapshot.battlefield);
    this.staticRenderer.render(snapshot);
    this.updateSelectedLaneMesh(snapshot, safeLaneIndex);
    this.baseVisualSystem.render(snapshot);
    this.towerVisualSystem.render(snapshot);
    this.unitVisualSystem.render(snapshot);
  }

  public dispose(): void {
    window.removeEventListener("resize", this.onWindowResize);
    window.cancelAnimationFrame(this.animationFrameId);

    const modelPoolStats = this.unitVisualSystem.getModelPoolStats();
    if (modelPoolStats.length > 0) {
      console.info("[ThreeBattlefieldScene] Unit model pool stats", modelPoolStats);
    }

    this.staticRenderer.dispose();
    this.baseVisualSystem.dispose();
    this.towerVisualSystem.dispose();
    this.unitVisualSystem.dispose();

    this.scene.remove(this.selectedLaneMesh);
    this.selectedLaneMesh.geometry.dispose();
    (this.selectedLaneMesh.material as THREE.Material).dispose();

    this.renderer.dispose();
    this.viewportElement.removeChild(this.renderer.domElement);
  }

  private configureLighting(): void {
    const ambient = new THREE.AmbientLight(0xb8cae6, 0.95);
    this.scene.add(ambient);

    const skylight = new THREE.HemisphereLight(0xdbe9ff, 0x5a6d5f, 0.85);
    this.scene.add(skylight);

    const sun = new THREE.DirectionalLight(0xfff4dd, 1.35);
    sun.position.set(32, 58, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 180;
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xb7d5ff, 0.65);
    fill.position.set(-28, 34, -26);
    this.scene.add(fill);
  }

  private resizeRenderer(): void {
    const width = Math.max(this.viewportElement.clientWidth, 1);
    const height = Math.max(this.viewportElement.clientHeight, 1);
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private createSelectedLaneMesh(): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, LANE_SPACING - 0.6),
      new THREE.MeshBasicMaterial({
        color: 0xffe083,
        transparent: true,
        opacity: 0.3,
        depthWrite: false
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.12;
    return mesh;
  }

  private updateSelectedLaneMesh(
    snapshot: BattleRoomSnapshot,
    selectedLaneIndex: number
  ): void {
    this.selectedLaneMesh.position.z = laneToWorldZ(
      selectedLaneIndex,
      snapshot.battlefield.laneCount,
      LANE_SPACING
    );

    const width = snapshot.battlefield.laneLength + WORLD_MARGIN;
    this.selectedLaneMesh.scale.set(width, 1, 1);
  }
}
