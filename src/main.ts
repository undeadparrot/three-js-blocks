import { GameState } from "./gamestate";

const gamestate = new GameState(16, 16, 16);
window.game = gamestate;

window.addEventListener("resized", gamestate.resizeWindow);
gamestate.resizeWindow();

export function animate() {
  gamestate.update();
  requestAnimationFrame(animate);
}
animate();
