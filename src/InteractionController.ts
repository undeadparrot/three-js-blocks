import { Vector2 } from "three";

export class InteractionController {
  firstUpdate: boolean;
  mousePosPrevious: Vector2;
  mousePos: Vector2;
  mouseDelta: Vector2;
  wheelDelta: Vector2;
  wheelDeltaTemp: Vector2;
  leftDown: Boolean;
  leftDownTime: Date;
  leftUpTime: Date;
  leftDownPos: Vector2;
  leftUpPos: Vector2;
  shiftDown: Boolean;
  shiftDownTemp: Boolean;
  constructor() {
    this.firstUpdate = true;
    this.mousePosPrevious = new Vector2(0, 0);
    this.mousePos = new Vector2(0, 0);
    this.mouseDelta = new Vector2(0, 0);
    this.leftDown = false;
    this.leftDownTime = new Date();
    this.leftUpTime = new Date();
    this.leftDownPos = new Vector2(0, 0);
    this.leftUpPos = new Vector2(0, 0);
    this.wheelDelta = new Vector2(0, 0);
    this.wheelDeltaTemp = new Vector2(0, 0);
    this.shiftDown = false;
    this.shiftDownTemp = false;
  }
  install(element: HTMLElement) {
    element.addEventListener("mousemove", (event: MouseEvent) => {
      this.mousePos.set(event.clientX, event.clientY);
    });
    element.addEventListener("click", (event: MouseEvent) => {
      console.log("click", event.type, event.button, event.buttons);
    });
    element.addEventListener("mousedown", (event: MouseEvent) => {
      console.log("mousedown", event.type, event.button, event.buttons);
      if(event.button === 0){
          this.leftDown = true;
          this.leftDownPos = this.mousePos;
          this.leftDownTime = new Date();
      }
    });
    element.addEventListener("mouseup", (event: MouseEvent) => {
      console.log("mouseup", event.type, event.button, event.buttons);
      if(event.button === 0){
          this.leftDown = false;
          this.leftUpPos = this.mousePos;
          this.leftUpTime = new Date();
      }
    });
    element.addEventListener("wheel", (event: WheelEvent) => {
      this.wheelDeltaTemp.add(new Vector2(event.deltaX, event.deltaY));
    });
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      console.log("keydown", event.shiftKey, event.key, event.type, event.code);
      if(event.code === "ShiftLeft"){
        this.shiftDownTemp = true;
      }
    });
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if(event.code === "ShiftLeft"){
        this.shiftDownTemp = false;
      }
    });
  }
  update() {
    this.firstUpdate = false;
    this.mouseDelta.copy(this.mousePos).sub(this.mousePosPrevious);
    this.mousePosPrevious.copy(this.mousePos);
    this.wheelDelta.copy(this.wheelDeltaTemp);
    this.wheelDeltaTemp.set(0,0);
    this.shiftDown = this.shiftDownTemp;
  }
}
