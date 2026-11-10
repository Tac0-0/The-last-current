import "./style.css";
import { loadProgress } from "./storage/progress.js";
import { RunState } from "./game/systems/RunState.js";
import { AudioCues } from "./game/audio.js";
import { UIController } from "./ui/uiController.js";
import { createGame } from "./game/createGame.js";

let ui, scene;
const model = new RunState(loadProgress(), (event) => {
  ui?.handleEvent(event);
  scene?.effect(event);
});
const audio = new AudioCues(model.progress);
ui = new UIController(model, audio);
({ scene } = createGame(model, ui));
