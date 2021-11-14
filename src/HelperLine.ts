import * as THREE from "three";
import { AxesHelper, Group, Line, Vector3 } from "three";

export class HelperLine {
  origin: Vector3;
  target: Vector3;
  obj: Group;
  private line: Line;
  private axes: AxesHelper;
  constructor() {
    this.origin = new Vector3();
    this.target = new Vector3();
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });
    const geometry = new THREE.BufferGeometry();
    this.line = new THREE.Line(geometry, material);
    this.axes = new THREE.AxesHelper(0.5);
    this.obj = new THREE.Group();
    this.obj.add(this.line);
    this.obj.add(this.axes);
  }

  update() {
    const points = [];
    points.push(this.origin);
    points.push(this.origin.clone().setY(0));
    points.push(this.target.clone().setY(0));
    points.push(this.target);
    points.push(this.origin);
    this.line.geometry.setFromPoints(points);
    this.axes.position.copy(this.target);
  }
}
