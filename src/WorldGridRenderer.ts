import * as THREE from "three";
import { WorldGrid } from "./WorldGrid";
import tileset2 from "./tileset2.png";
const FLOATS_PER_VERT_POSITION = 3;
const FLOATS_PER_VERT_UV = 2;
const VERTS_PER_TRIANGLE = 3;
export class WorldGridRenderer {
  private _group: THREE.Object3D;
  private _mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  private _loader: THREE.TextureLoader;
  private _texture: THREE.DataTexture;
  private _positionAttribute: THREE.BufferAttribute;
  private _uvAttribute: THREE.BufferAttribute;
  private _positionBuffer: Float32Array;
  private _uvBuffer: Float32Array;
  public get object3D(): THREE.Object3D {
    return this._group;
  }
  constructor() {
    this._group = new THREE.Group();

    this._loader = new THREE.TextureLoader();
    this._texture = this._loader.load(tileset2);

    /* for crisp pixellated textures */
    this._texture.magFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;

    const geom = new THREE.BufferGeometry();
    this._positionBuffer = new Float32Array(
      512 * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_POSITION
    );
    this._positionAttribute = new THREE.BufferAttribute(
      this._positionBuffer,
      FLOATS_PER_VERT_POSITION
    );
    geom.setAttribute("position", this._positionAttribute);
    this._uvBuffer = new Float32Array(
      512 * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_UV
    );
    this._uvAttribute = new THREE.BufferAttribute(
      this._uvBuffer,
      FLOATS_PER_VERT_UV
    );
    geom.setAttribute("uv", this._uvAttribute);

    const material = new THREE.MeshStandardMaterial({ map: this._texture });
    this._mesh = new THREE.Mesh(geom, material);
    this._group.add(this._mesh);
  }
  resizeBuffers(tris: number) {
    const new_positionBuffer = new Float32Array(
      tris * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_POSITION
    );
    for (let i in this._positionBuffer) {
      new_positionBuffer[i] = this._positionBuffer[i];
    }
    this._positionBuffer = new_positionBuffer;

    const new_uvBuffer = new Float32Array(
      tris * VERTS_PER_TRIANGLE * FLOATS_PER_VERT_UV
    );
    for (let i in this._uvBuffer) {
      new_uvBuffer[i] = this._uvBuffer[i];
    }
    this._uvBuffer = new_uvBuffer;

    this._positionAttribute = new THREE.BufferAttribute(
      this._positionBuffer,
      FLOATS_PER_VERT_POSITION
    );
    this._mesh.geometry.setAttribute("position", this._positionAttribute);
    this._uvAttribute = new THREE.BufferAttribute(
      this._uvBuffer,
      FLOATS_PER_VERT_UV
    );
    this._mesh.geometry.setAttribute("uv", this._uvAttribute);

    this._mesh.geometry.setDrawRange(0, tris * VERTS_PER_TRIANGLE);
  }
  update = (grid: WorldGrid) => {
    let tris = 0;
    let i = 0;
    let j = 0;
    for (let x = 0; x < grid.x; x++) {
      for (let y = 0; y < grid.y; y++) {
        for (let z = 0; z < grid.z; z++) {
          const blocktype = grid.get(x, y, z) || 0;
          if (blocktype === null || blocktype < 1) {
            continue;
          }
          const tex = TEXTURES[blocktype];

          for (const face of boxfaces) {
            const adjacentBlock =
              grid.get(
                x + face.offset.x,
                y + face.offset.y,
                z + face.offset.z
              ) || 0;
            if (adjacentBlock > 0) {
              continue;
            }
            const nextItems = tris + 2;
            const currentItems =
              this._positionAttribute.array.length /
              FLOATS_PER_VERT_POSITION /
              VERTS_PER_TRIANGLE;
            if (nextItems > currentItems) {
              const nextBufferTris = Math.max(Math.floor(tris * 2), 16);
              console.log(
                "Resizing buffers from ",
                currentItems,
                "to ",
                nextBufferTris
              );
              this.resizeBuffers(nextBufferTris);
            }
            const positions = this._positionBuffer;
            const uvs = this._uvBuffer;
            uvs[j++] = tex.p0.x;
            uvs[j++] = tex.p0.y;
            positions[i++] = face.p0.x + x;
            positions[i++] = (face.p0.y + y) * 1;
            positions[i++] = face.p0.z + z; //

            uvs[j++] = tex.p1.x;
            uvs[j++] = tex.p1.y;
            positions[i++] = face.p1.x + x;
            positions[i++] = (face.p1.y + y) * 1;
            positions[i++] = face.p1.z + z; //

            uvs[j++] = tex.p2.x;
            uvs[j++] = tex.p2.y;
            positions[i++] = face.p2.x + x;
            positions[i++] = (face.p2.y + y) * 1;
            positions[i++] = face.p2.z + z; //
            tris += 1;

            uvs[j++] = tex.p2.x;
            uvs[j++] = tex.p2.y;
            positions[i++] = face.p2.x + x;
            positions[i++] = (face.p2.y + y) * 1;
            positions[i++] = face.p2.z + z; //

            uvs[j++] = tex.p3.x;
            uvs[j++] = tex.p3.y;
            positions[i++] = face.p3.x + x;
            positions[i++] = (face.p3.y + y) * 1;
            positions[i++] = face.p3.z + z; //

            uvs[j++] = tex.p0.x;
            uvs[j++] = tex.p0.y;
            positions[i++] = face.p0.x + x;
            positions[i++] = (face.p0.y + y) * 1;
            positions[i++] = face.p0.z + z; //
            tris += 1;
          }
        }
      }
    }

    this._positionAttribute.needsUpdate = true;
    this._uvAttribute.needsUpdate = true;
    this._mesh.geometry.computeVertexNormals();
    this._mesh.geometry.computeBoundingBox();
    this._mesh.geometry.computeBoundingSphere();
  };
  raycast = (raycaster: THREE.Raycaster) => {
    const intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = [];
    this._mesh.raycast(raycaster, intersects);
    return intersects;
  };
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
const xyz = new THREE.Vector3(0, 0, 0); //[0,0,0]; // xyz.x = 0; xyz.y = 0; xyz.z =0;
const Xyz = new THREE.Vector3(1, 0, 0); //[1,0,0]; // Xyz.x = 1; Xyz.y = 0; Xyz.z =0;
const xYz = new THREE.Vector3(0, 1, 0); //[0,1,0]; // xYz.x = 0; xYz.y = 1; xYz.z =0;
const xyZ = new THREE.Vector3(0, 0, 1); //[0,0,1]; // xyZ.x = 0; xyZ.y = 0; xyZ.z =1;
const XYz = new THREE.Vector3(1, 1, 0); //[1,1,0]; // XYz.x = 1; XYz.y = 1; XYz.z =0;
const XyZ = new THREE.Vector3(1, 0, 1); //[1,0,1]; // XyZ.x = 1; XyZ.y = 0; XyZ.z =1;
const xYZ = new THREE.Vector3(0, 1, 1); //[0,1,1]; // xYZ.x = 0; xYZ.y = 1; xYZ.z =1;
const XYZ = new THREE.Vector3(1, 1, 1); //[1,1,1]; // XYZ.x = 1; XYZ.y = 1; XYZ.z =1;

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
  p0: THREE.Vector3;
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  p3: THREE.Vector3;
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

class TextureCoords {
  tl: THREE.Vector2;
  p0: THREE.Vector2;
  p1: THREE.Vector2;
  p2: THREE.Vector2;
  p3: THREE.Vector2;
  constructor(x: number, y: number) {
    this.tl = new THREE.Vector2(x, y);

    this.p0 = new THREE.Vector2(x + 0.5, y + 0.5);
    this.p1 = new THREE.Vector2(x, y + 0.5);
    this.p2 = new THREE.Vector2(x, y);
    this.p3 = new THREE.Vector2(x + 0.5, y);
  }
}

export const TEXTURES = [
  new TextureCoords(0, 0),
  new TextureCoords(0, 0),
  new TextureCoords(0.5, 0),
  new TextureCoords(0, 0.5),
  new TextureCoords(0.5, 0.5),
];
