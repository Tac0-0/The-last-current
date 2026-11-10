import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";
export function createGame(model, view) {
  const scene = new GameScene(model, view);
  const game = new Phaser.Game({
    // Canvas is ample for this small scene and avoids software-WebGL stalls on school PCs.
    type: Phaser.CANVAS,
    parent: "canvas-host",
    width: 1280,
    height: 720,
    backgroundColor: "#113b46",
    scene: [scene],
    banner: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, roundPixels: false },
    // The model owns delta clamping. A timer loop also tolerates streamed displays
    // that throttle requestAnimationFrame even while the document is visible.
    fps: { target: 60, smoothStep: false, forceSetTimeOut: true },
    audio: { noAudio: true },
  });
  return { game, scene };
}
