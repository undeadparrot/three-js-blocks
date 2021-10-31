import * as THREE from "three";
import { Vector3 } from "three";
import { Perlin2D } from "./perlin";
import {} from "three/examples/jsm/geometries/";

const GRADIENT_RESOLUTION = 16;
export const perlin = new Perlin2D(GRADIENT_RESOLUTION, GRADIENT_RESOLUTION);

class WorldGrid {
  public x: number;
  public y: number;
  public z: number;
  public data: boolean[][][];
  public get(x: number, y: number, z: number) {
    if (x >= this.x || y >= this.y || z >= this.z) {
      return null;
    }
    if (x < 0 || y < 0 || z < 0) {
      return null;
    }
    return this.data[x][y][z];
  }
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.data = [];

    for (let x = 0; x < this.x; x++) {
      this.data.push([]);
      for (let y = 0; y < this.y; y++) {
        this.data[x].push([]);
        for (let z = 0; z < this.z; z++) {
          this.data[x][y].push(false);
        }
      }
    }

    for (let x = 0; x < this.x; x++) {
      for (let z = 0; z < this.z; z++) {
        const v = Math.max(
          Math.floor((perlin.get(x * 0.5, z * 0.5) + 0.5) * 4),
          0
        );
        for (let y = 0; y <= v; y++) {
          this.data[x][y][z] = true;
        }

        const v2 =
          this.y -
          Math.max(Math.floor((perlin.get(x * 0.5, z * 0.5) + 0.5) * 4), 1);
        for (let y = v2; y < this.y; y++) {
          this.data[x][y][z] = true;
        }

        const v3 = 8 + Math.floor((perlin.get(x * 0.5, z * 0.5) + 0.5) * 16);
        if (v3 > 0 && v3 < this.y) {
          this.data[x][v3][z] = true;
        }
      }
    }
  }
}
export function makeGrid(): WorldGrid {
  const world = new WorldGrid(16, 16, 16);
  return world;
}

/*
       ?? --- ??
      /      / |
    ?? --- ??  ??
    |       | /
    ?? --- ??

         xYz ---- XYz
        /         / |
      /    Y+   /   |
    xYZ ---- XYZ    |
    | (xyz)    |   Xyz
    |    Z+    |  /
    |          |/
    xyZ ---- XyZ
    
    Points for x+ face:
       .. --- p0        .. --- p0    p0 = XYz
      /      / |       /      / |    p1 = XYZ
    .. --- p1  .     .. --- ..  p3   p2 = XyZ
    |   /   | /      |   /   | /     p3 = Xyz
    .. --- p2        .. --- p2    

    Points for y+ face:
       p1 --- p0        .. --- p0    p0 = XYz
      /      / |       /      / |    p1 = xYz
    p2 --- ..  .     p2 --- p3  .    p2 = xYZ
    |       | /      |       | /     p3 = XYZ
    .. --- ..        .. --- ..    

    Points for z+ face:
       .. --- ..        .. --- ..    p0 = XYZ
      /      / |       /      / |    p1 = xYZ
    p1 --- p0  .     .. --- p0  .    p2 = xyZ
    |   /   | /      |   /   | /     p3 = XyZ
    p2 --- ..        p2 --- p3    

    
*/

//#region corners
const xyz = new Vector3(0, 0, 0); //[0,0,0]; // xyz.x = 0; xyz.y = 0; xyz.z =0;
const Xyz = new Vector3(1, 0, 0); //[1,0,0]; // Xyz.x = 1; Xyz.y = 0; Xyz.z =0;
const xYz = new Vector3(0, 1, 0); //[0,1,0]; // xYz.x = 0; xYz.y = 1; xYz.z =0;
const xyZ = new Vector3(0, 0, 1); //[0,0,1]; // xyZ.x = 0; xyZ.y = 0; xyZ.z =1;
const XYz = new Vector3(1, 1, 0); //[1,1,0]; // XYz.x = 1; XYz.y = 1; XYz.z =0;
const XyZ = new Vector3(1, 0, 1); //[1,0,1]; // XyZ.x = 1; XyZ.y = 0; XyZ.z =1;
const xYZ = new Vector3(0, 1, 1); //[0,1,1]; // xYZ.x = 0; xYZ.y = 1; xYZ.z =1;
const XYZ = new Vector3(1, 1, 1); //[1,1,1]; // XYZ.x = 1; XYZ.y = 1; XYZ.z =1;

export const boxcorners = [
  { name: "xyz", v3: xyz },
  { name: "Xyz", v3: Xyz },
  { name: "xYz", v3: xYz },
  { name: "xyZ", v3: xyZ },
  { name: "XYz", v3: XYz },
  { name: "XyZ", v3: XyZ },
  { name: "xYZ", v3: xYZ },
  { name: "XYZ", v3: XYZ },
];
//#endregion corners

type BoxFace = {
  name: string;
  offset: { x: number; y: number; z: number };
  p0: Vector3;
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
};

export const boxfaces: BoxFace[] = [
  {
    name: "x-front", //
    offset: { x: 1, y: 0, z: 0 },
    p0: XYz,
    p1: XYZ,
    p2: XyZ,
    p3: Xyz,
  },
  {
    name: "x-back", //
    offset: { x: -1, y: 0, z: 0 },
    p0: xYz,
    p1: xyz,
    p2: xyZ,
    p3: xYZ,
  },
  {
    name: "y-top", //
    offset: { x: 0, y: 1, z: 0 },
    p0: XYz,
    p1: xYz,
    p2: xYZ,
    p3: XYZ,
  },
  {
    name: "y-bottom", //
    offset: { x: 0, y: -1, z: 0 },
    p0: Xyz,
    p1: XyZ,
    p2: xyZ,
    p3: xyz,
  },
  {
    name: "z-front", //
    offset: { x: 0, y: 0, z: 1 },
    p0: XYZ,
    p1: xYZ,
    p2: xyZ,
    p3: XyZ,
  },
  {
    name: "z-back", //
    offset: { x: 0, y: 0, z: -1 },
    p0: XYz,
    p1: Xyz,
    p2: xyz,
    p3: xYz,
  },
];

export function makeTerrain() {
  const world = makeGrid();
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshStandardMaterial();
  const thing = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(thing);
  const v3array: number[] = [];
  for (let x = 0; x < world.x; x++) {
    for (let y = 0; y < world.y; y++) {
      for (let z = 0; z < world.z; z++) {
        if (!world.get(x, y, z)) {
          continue;
        }
        const y2 = y * 0.15;

        for (const face of boxfaces) {
          const adjacentBlock = world.get(
            x + face.offset.x,
            y + face.offset.y,
            z + face.offset.z
          );
          if (adjacentBlock) {
            continue;
          }
          v3array.push(face.p0.x + x);
          v3array.push((face.p0.y + y) * 0.15);
          v3array.push(face.p0.z + z); //
          v3array.push(face.p1.x + x);
          v3array.push((face.p1.y + y) * 0.15);
          v3array.push(face.p1.z + z); //
          v3array.push(face.p2.x + x);
          v3array.push((face.p2.y + y) * 0.15);
          v3array.push(face.p2.z + z); //
          v3array.push(face.p2.x + x);
          v3array.push((face.p2.y + y) * 0.15);
          v3array.push(face.p2.z + z); //
          v3array.push(face.p3.x + x);
          v3array.push((face.p3.y + y) * 0.15);
          v3array.push(face.p3.z + z); //
          v3array.push(face.p0.x + x);
          v3array.push((face.p0.y + y) * 0.15);
          v3array.push(face.p0.z + z); //
        }
      }
    }
  }
  const f32buffer = new Float32Array(v3array);
  geometry.setAttribute("position", new THREE.BufferAttribute(f32buffer, 3));
  geometry.computeVertexNormals();

  const wireframe = new THREE.WireframeGeometry(geometry);

  const line = new THREE.LineSegments(wireframe);
  // line.material.depthTest = false;
  // line.material.opacity = 0.25;
  // line.material.transparent = true;
  line.material.color = new THREE.Color("blue");

  // group.add( line );

  return group;
}
