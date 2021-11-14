/*
  Perlin noise generator
  adapted from https://github.com/joeiddon/perlin
  and from https://adrianb.io/2014/08/09/perlinnoise.html
*/

type Vec2 = {
  x: number;
  y: number;
};

function randomVec2(): Vec2 {
  const theta = Math.random() * 2 * Math.PI;
  return {
    x: Math.cos(theta),
    y: Math.sin(theta),
  };
}

function smootherstep(x: number) {
  return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
}

function interpolate(x: number, a: number, b: number) {
  return a + smootherstep(x) * (b - a);
}

type GradientsGrid = Vec2[][];
export class Perlin2D {
  private gradients: GradientsGrid;
  private width: number;
  private height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.gradients = [];

    for (let x = 0; x < width; x++) {
      const row = [];
      for (let y = 0; y < height; y++) {
        row.push(randomVec2());
      }
      this.gradients.push(row);
    }
  }
  private dotProduct = (
    x: number,
    y: number,
    vX: number,
    vY: number
  ): number => {
    const dVec = { x: x - vX, y: y - vY };
    const gradient = this.gradients[vX % this.width][vY % this.height];
    return dVec.x * gradient.x + dVec.y * gradient.y;
  };
  get = (x: number, y: number): number => {
    const xFloor = Math.floor(x);
    const yFloor = Math.floor(y);
    const topLeft = this.dotProduct(x, y, xFloor, yFloor);
    const topRight = this.dotProduct(x, y, xFloor + 1, yFloor);
    const botLeft = this.dotProduct(x, y, xFloor, yFloor + 1);
    const botRight = this.dotProduct(x, y, xFloor + 1, yFloor + 1);
    const xTop = interpolate(x - xFloor, topLeft, topRight);
    const xBottom = interpolate(x - xFloor, botLeft, botRight);
    return interpolate(y - yFloor, xTop, xBottom);
  };
  getOctave = (
    x: number,
    y: number,
    octaves: number,
    persistence: number
  ): number => {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let totalAmplitude = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.get(x * frequency, y * frequency) * amplitude;
      totalAmplitude += amplitude;

      frequency *= 2;
      amplitude *= persistence;
    }
    return total / totalAmplitude;
  };
}
