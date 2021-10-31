import * as THREE from "three";
import { perlin } from "./main";

export function makeBlockyTerrain() {
  const group = new THREE.Group();
  const v3array: number[] = [];
  for (let x = 0; x < 4; x++) {
    for (let z = 0; z < 4; z++) {
      let v = Math.floor((perlin.get(x * 0.5, z * 0.5) + 0.5) * 5);
      
      const geometry = new THREE.BoxBufferGeometry();
      const material = new THREE.MeshStandardMaterial({ color: 0x505050 });
      const cube = new THREE.Mesh(geometry, material);
      cube.translateX(0.5+x*2);
      cube.translateY(0.5+v);
      cube.translateZ(-5+0.5+z);
      group.add(cube);
    }
  }
  return group;
}
