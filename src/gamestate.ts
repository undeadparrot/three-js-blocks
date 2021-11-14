import * as THREE from "three";
import { WorldGrid } from "./WorldGrid";
import { WorldGridRenderer } from "./WorldGridRenderer";
import { InteractionController } from "./InteractionController";
import {
  CLEAR_COLOR,
  RED,
  GREEN,
  BLUE,
  XPLUS,
  YPLUS,
  ZPLUS,
} from "./constants";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

export class GameState {
  grid: WorldGrid;
  interactions: InteractionController;
  activeBlock: number;
  clock: THREE.Clock;
  scene: THREE.Scene;
  orthocam: THREE.OrthographicCamera;
  orthozoom: number;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  renderp: RenderPass;
  effectFXAA: ShaderPass;
  hitarrow: THREE.ArrowHelper;
  hitarrow2: THREE.ArrowHelper;
  hitarrow3: THREE.ArrowHelper;
  hitcage: THREE.Box3Helper;
  element: HTMLDivElement;
  gridRenderer: WorldGridRenderer;
  constructor(width: number, height: number, depth: number) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.activeBlock = 1;

    this.orthocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.orthocam.position.x = 12;
    this.orthocam.position.y = 5;
    this.orthocam.position.z = 25;
    this.orthocam.rotation.set(-0.25, 0.4, 0.0);
    this.orthozoom = 9;

    /* the renderer */
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(CLEAR_COLOR);
    this.composer = new EffectComposer(this.renderer);
    this.renderp = new RenderPass(this.scene, this.orthocam);
    this.composer.addPass(this.renderp);

    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.renderToScreen = true;
    this.effectFXAA.enabled = false;
    this.composer.addPass(this.effectFXAA);

    /* lighting */
    var ambientLight = new THREE.AmbientLight(0x33_44_55);
    this.scene.add(ambientLight);

    var light = new THREE.PointLight(0xffffff, 3, 50, 5);
    light.position.set(2, 2, 0);
    this.scene.add(light);

    /* some debugging shapes */
    this.hitarrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.5,
      RED,
      0.2,
      0.2
    );
    this.scene.add(this.hitarrow);
    this.hitarrow2 = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.5,
      GREEN,
      0.2,
      0.2
    );
    this.scene.add(this.hitarrow2);
    this.hitarrow3 = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.5,
      BLUE,
      0.2,
      0.2
    );
    this.scene.add(this.hitarrow3);
    this.hitcage = new THREE.Box3Helper(new THREE.Box3(), GREEN);
    this.scene.add(this.hitcage);

    const axes = new THREE.AxesHelper(1);
    this.scene.add(axes);
    axes.setColors(RED, GREEN, BLUE);
    axes.translateX(0.001);
    axes.translateY(0.001);

    const gridHelper = new THREE.GridHelper(16, 16);
    this.scene.add(gridHelper);

    /* the game stuff */
    this.grid = new WorldGrid(width, height, depth);
    this.interactions = new InteractionController();
    this.gridRenderer = new WorldGridRenderer();
    this.scene.add(this.gridRenderer.object3D);

    /* mount on the page */
    this.element = document.querySelector<HTMLDivElement>("#app")!;
    this.interactions.install(this.element);
    this.element.appendChild(this.renderer.domElement);
  }
  resizeWindow = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const orthoratio = window.innerWidth / window.innerHeight;
    this.orthocam.left = -1 * this.orthozoom * orthoratio;
    this.orthocam.right = this.orthozoom * orthoratio;
    this.orthocam.top = this.orthozoom;
    this.orthocam.bottom = -1 * this.orthozoom;
    this.orthocam.updateProjectionMatrix();

    this.composer.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    this.composer.setPixelRatio(window.devicePixelRatio);
    this.effectFXAA.uniforms["resolution"].value.set(
      (1 / window.innerWidth) * window.devicePixelRatio,
      (1 / window.innerHeight) * window.devicePixelRatio
    );
  };
  update = () => {
    const delta = this.clock.getDelta();
    this.composer.render();
    // this.light.updateMatrix();
    this.gridRenderer.update(this.grid);

    if (this.interactions.leftDown || this.interactions.leftClicked) {
      const x =
        (this.interactions.leftDownPos.x / this.element.clientWidth) * 2 - 1;
      const y =
        1 - (this.interactions.leftDownPos.y / this.element.clientHeight) * 2;
      const screenSpace = new THREE.Vector3(x, y, 0);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(screenSpace, this.orthocam);

      const hits = this.gridRenderer.raycast(raycaster);
      const firstHit = hits[hits.length-1];
      console.log(hits);

      if (firstHit !== undefined) {
        this.hitarrow.position.copy(firstHit.point);
        if (firstHit.face) {
          this.hitarrow.setDirection(firstHit.face.normal);
          const face = firstHit.face;
          const p0 = firstHit.point.clone();
          p0.floor();
          const p1 = p0.clone();
          let facename = "unknown";
          const blockHit = p0.clone();
          if (face.normal.dot(YPLUS) > 0.9) {
            facename = "Y+";
            p1.setX(p1.x + 1);
            p1.setY(p1.y + 1);
            p1.setZ(p1.z + 1);
            blockHit.setY(blockHit.y-1);
          } else if (face.normal.dot(XPLUS) > 0.9) {
            facename = "X+";
            p1.setX(p1.x + 1);
            p1.setY(p1.y + 1);
            p1.setZ(p1.z + 1);
            blockHit.setX(blockHit.x-1);
          } else if (face.normal.dot(ZPLUS) > 0.9) {
            facename = "Z+";
            p1.setX(p1.x + 1);
            p1.setY(p1.y + 1);
            p1.setZ(p1.z + 1);
            blockHit.setZ(blockHit.z-1);
          }
          if(this.interactions.leftClicked) {
            if(this.interactions.shiftDown){
              this.grid.toggle(blockHit.x, blockHit.y, blockHit.z, 0);
            }else{
              this.grid.toggle(p0.x, p0.y, p0.z, 2);
            }
          }
          this.hitarrow2.position.copy(p0);
          this.hitarrow3.position.copy(p1);
          this.hitcage.box.setFromPoints([p0, p1]);


          const debugtext = document.querySelector<HTMLDivElement>(
            "#debugtext"
          )!;
          debugtext.innerHTML = `
        <pre>${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${p0.z.toFixed(2)}</pre>
        <pre>${p1.x.toFixed(2)} ${p1.y.toFixed(2)} ${p1.z.toFixed(2)}</pre>
        <pre>faceindex: ${firstHit.faceIndex} </pre>
        <pre>abc: ${face.a} ${face.b} ${face.c}</pre>
        <pre>normal: ${face.normal.x.toFixed(1)},${face.normal.y.toFixed(
            1
          )},${face.normal.z.toFixed(1)}</pre>
        <pre>${facename}</pre>
        `;

        }
      }
    }
    if (this.interactions.shiftDown) {
      this.orthozoom = Math.min(
        Math.max(
          this.orthozoom + this.interactions.wheelDelta.y * 0.5 * delta,
          1
        ),
        50
      );
      this.resizeWindow();
    } else {
      this.orthocam.translateX(-this.interactions.wheelDelta.x * delta);
      this.orthocam.translateY(this.interactions.wheelDelta.y * delta);
    }
    this.interactions.update();
  };
}
