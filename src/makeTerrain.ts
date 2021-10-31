import * as THREE from "three";
import { perlin } from "./main";

type WorldGrid = {
  x: number;
  y: number;
  z: number;
  data: boolean[][][];
};
export function makeGrid(): WorldGrid {
  const world: WorldGrid = {
    x: 16,
    y: 16,
    z: 16,
    data: [],
  };

  for (let x = 0; x < world.x; x++) {
    world.data.push([]);
    for (let y = 0; y < world.y; y++) {
      world.data[x].push([]);
      for (let z = 0; z < world.z; z++) {
        world.data[x][y].push(false);
      }
    }
  }

  for (let x = 0; x < world.x; x++) {
    for (let z = 0; z < world.z; z++) {
      const v = Math.floor((perlin.get(x * 0.5, z * 0.5) + 0.5) * 8);
      for (let y = 0; y <= v; y++) {
        world.data[x][y][z] = true;
      }
    }
  }

  return world;
}

export function makeTerrain() {
  const world = makeGrid();
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshStandardMaterial();
  const thing = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(thing);
  const v3array: number[] = [];
  for (let x = 0; x < world.x; x++) {
    for (let _y = 0; _y < world.y; _y++) {
      for (let z = 0; z < world.z; z++) {
        const y = _y * 0.15;

        if (!world.data[x][_y][z]) {
          continue;
        }
        v3array.push(x + 1);
        v3array.push(y);
        v3array.push(z + 1);

        v3array.push(x + 1);
        v3array.push(y);
        v3array.push(z);

        v3array.push(x);
        v3array.push(y);
        v3array.push(z);

        v3array.push(x);
        v3array.push(y);
        v3array.push(z);

        v3array.push(x);
        v3array.push(y);
        v3array.push(z + 1);

        v3array.push(x + 1);
        v3array.push(y);
        v3array.push(z + 1);
      }
    }
  }
  const f32buffer = new Float32Array(v3array);
  geometry.setAttribute("position", new THREE.BufferAttribute(f32buffer, 3));
  geometry.computeVertexNormals();

  return group;
}
