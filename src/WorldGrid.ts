export class WorldGrid {
  public x: number;
  public y: number;
  public z: number;
  public data: number[][][];
  public get(x: number, y: number, z: number) {
    if (x >= this.x || y >= this.y || z >= this.z) {
      return null;
    }
    if (x < 0 || y < 0 || z < 0) {
      return null;
    }
    return this.data[x][y][z];
  }
  public toggle(x: number, y: number, z: number, value: number) {
    if (!this.get(x,y,z)) {
      this.data[x][y][z] = 0;
    }
    this.data[x][y][z] = value;
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
          this.data[x][y].push(0);
        }
      }
    }

    for (let x = 0; x < this.x; x++) {
      for (let z = 0; z < this.z; z++) {
        this.data[x][0][z] = 2;
        this.data[x][1][z] = 2;
        this.data[x][2][z] = 1;
        this.data[x][3][z] = 3;
      }
    }
  }
}
