import * as THREE from "three";
import { BattleRoomSnapshot } from "@tdpvp/shared";
import { serverXToWorldX } from "../../lib/world-mapping.js";

/**
 * Renders base meshes from authoritative battlefield base state.
 */
export class BaseVisualSystem {
  private readonly scene: THREE.Scene;
  private readonly leftBaseMesh: THREE.Mesh;
  private readonly rightBaseMesh: THREE.Mesh;

  public constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.leftBaseMesh = this.createBaseMesh();
    this.rightBaseMesh = this.createBaseMesh();
    this.scene.add(this.leftBaseMesh);
    this.scene.add(this.rightBaseMesh);
  }

  public render(snapshot: BattleRoomSnapshot): void {
    const { battlefield } = snapshot;

    this.leftBaseMesh.position.set(
      serverXToWorldX(battlefield.bases.left.positionX, battlefield.laneLength),
      2.4,
      0
    );
    this.rightBaseMesh.position.set(
      serverXToWorldX(battlefield.bases.right.positionX, battlefield.laneLength),
      2.4,
      0
    );

    const leftRatio = battlefield.bases.left.hp / battlefield.bases.left.maxHp;
    const rightRatio = battlefield.bases.right.hp / battlefield.bases.right.maxHp;

    const leftMaterial = this.leftBaseMesh.material as THREE.MeshStandardMaterial;
    const rightMaterial = this.rightBaseMesh.material as THREE.MeshStandardMaterial;

    leftMaterial.color.setRGB(0.35 + leftRatio * 0.5, 0.3 + leftRatio * 0.55, 0.34);
    rightMaterial.color.setRGB(0.32, 0.35 + rightRatio * 0.4, 0.4 + rightRatio * 0.45);
  }

  public dispose(): void {
    this.disposeMesh(this.leftBaseMesh);
    this.disposeMesh(this.rightBaseMesh);
  }

  private createBaseMesh(): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 4.8, 3.8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private disposeMesh(mesh: THREE.Mesh): void {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
}
