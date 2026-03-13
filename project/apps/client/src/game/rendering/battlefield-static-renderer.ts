import * as THREE from "three";
import { BattleRoomSnapshot } from "@tdpvp/shared";
import { LANE_SPACING, WORLD_MARGIN } from "../../config/render-config.js";
import {
  laneBoundaryToWorldZ,
  serverXToWorldX
} from "../../lib/world-mapping.js";

/**
 * Renders static battlefield board geometry from authoritative battlefield dimensions.
 */
export class BattlefieldStaticRenderer {
  private readonly scene: THREE.Scene;
  private readonly staticGroup = new THREE.Group();
  private staticFieldKey = "";

  public constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.staticGroup);
  }

  public render(snapshot: BattleRoomSnapshot): void {
    const battlefield = snapshot.battlefield;
    const key = [
      battlefield.laneCount,
      battlefield.laneLength,
      battlefield.leftPlacementZoneStartX,
      battlefield.leftPlacementZoneEndX,
      battlefield.neutralZoneStartX,
      battlefield.neutralZoneEndX,
      battlefield.rightPlacementZoneStartX,
      battlefield.rightPlacementZoneEndX
    ].join(":");

    if (key === this.staticFieldKey) {
      return;
    }

    this.staticFieldKey = key;
    this.disposeGroup(this.staticGroup);

    const laneDepth = battlefield.laneCount * LANE_SPACING;
    const laneWidth = battlefield.laneLength + WORLD_MARGIN;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(laneWidth, laneDepth + WORLD_MARGIN),
      new THREE.MeshStandardMaterial({
        color: 0x355042,
        roughness: 0.94,
        metalness: 0.06
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.staticGroup.add(ground);

    for (let index = 0; index <= battlefield.laneCount; index += 1) {
      const z = laneBoundaryToWorldZ(index, battlefield.laneCount, LANE_SPACING);
      const laneLine = new THREE.Mesh(
        new THREE.BoxGeometry(
          battlefield.laneLength + WORLD_MARGIN / 2,
          0.1,
          0.12
        ),
        new THREE.MeshStandardMaterial({
          color: 0x3d4f65,
          roughness: 0.8,
          metalness: 0.05
        })
      );
      laneLine.position.set(0, 0.06, z);
      this.staticGroup.add(laneLine);
    }

    this.staticGroup.add(
      this.createZoneMesh(
        battlefield.leftPlacementZoneStartX,
        battlefield.leftPlacementZoneEndX,
        battlefield,
        0x2e6f4d,
        0.42
      )
    );
    this.staticGroup.add(
      this.createZoneMesh(
        battlefield.neutralZoneStartX,
        battlefield.neutralZoneEndX,
        battlefield,
        0x7a533e,
        0.46
      )
    );
    this.staticGroup.add(
      this.createZoneMesh(
        battlefield.rightPlacementZoneStartX,
        battlefield.rightPlacementZoneEndX,
        battlefield,
        0x32537a,
        0.42
      )
    );
  }

  public dispose(): void {
    this.disposeGroup(this.staticGroup);
    this.scene.remove(this.staticGroup);
  }

  private createZoneMesh(
    zoneStartX: number,
    zoneEndX: number,
    battlefield: BattleRoomSnapshot["battlefield"],
    color: number,
    opacity: number
  ): THREE.Mesh {
    const centerX = serverXToWorldX(
      (zoneStartX + zoneEndX) * 0.5,
      battlefield.laneLength
    );
    const width = Math.max(zoneEndX - zoneStartX, 1);
    const laneDepth = battlefield.laneCount * LANE_SPACING;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.08, laneDepth),
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity,
        roughness: 0.9,
        metalness: 0.05
      })
    );
    mesh.position.set(centerX, 0.05, 0);
    return mesh;
  }

  private disposeGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[group.children.length - 1];
      if (!child) {
        break;
      }

      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
  }
}
