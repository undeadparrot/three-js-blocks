import * as THREE from "three";
import { Color, Object3D, Scene } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { makeTerrain } from "./makeTerrain";

const app = document.querySelector<HTMLDivElement>("#app")!;

export const clock = new THREE.Clock();
export const SCENE = new THREE.Scene();
export const orthocam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new Color(0.9, 0.9, 0.9));
export const composer = new EffectComposer(renderer);
const renderp = new RenderPass(SCENE, orthocam);
composer.addPass(renderp);

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.renderToScreen = true;
effectFXAA.enabled = false;
composer.addPass(effectFXAA);
window.fxaa = effectFXAA;

var ambientLight = new THREE.AmbientLight("black");
SCENE.add(ambientLight);

var light = new THREE.PointLight(0xff0000, 3, 20, 5);
light.position.set(2, 2, 0);
SCENE.add(light);

const terrain = makeTerrain();
SCENE.add(terrain);

const axes = new THREE.AxesHelper(1);
SCENE.add(axes);
axes.setColors(
  new THREE.Color("red"),
  new THREE.Color("green"),
  new THREE.Color("blue")
);
axes.translateX(0.001);
axes.translateY(0.001);
window.axes = axes;
const gridHelper = new THREE.GridHelper(16, 16);
SCENE.add(gridHelper);
window.grid = gridHelper;

renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

window.addEventListener("resized", resizeWindow);
resizeWindow();

function resizeWindow() {
  const orthozoom = 5;
  const orthoratio = window.innerWidth / window.innerHeight;
  orthocam.left = -1 * orthozoom * orthoratio;
  orthocam.right = orthozoom * orthoratio;
  orthocam.top = orthozoom;
  orthocam.bottom = -1 * orthozoom;
  orthocam.position.x = 5;
  orthocam.position.y = 1;
  orthocam.position.z = 5;
  orthocam.rotation.set(-0.25, 0.4, 0.0);
  orthocam.updateProjectionMatrix();

  composer.setSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
  composer.setPixelRatio(window.devicePixelRatio);
  effectFXAA.uniforms["resolution"].value.set(
    (1 / window.innerWidth) * window.devicePixelRatio,
    (1 / window.innerHeight) * window.devicePixelRatio
  );
}

let t = 0;
export function animate() {
  const delta = clock.getDelta();
  composer.render();
  light.position.setX(3 + Math.cos(t * 2));
  light.position.setZ(3 + Math.sin(t * 2));
  light.updateMatrix();
  t += delta;
  orthocam.rotation.set(-0.25 * Math.sin(t), 0.4 * Math.cos(t), 0.0);
  requestAnimationFrame(animate);
}
animate();
