import assert from "node:assert/strict";
import { RunState } from "../src/game/systems/RunState.js";

// Uses public model actions and default balance. No invulnerability or boss skips.
for (const fps of [30, 60]) {
  const abilities = { disable: 0, surge: false };
  const m = new RunState(undefined, (event) => {
    if (event.type === "disable") abilities.disable++;
  });
  m.reset();
  m.build("skimmer", 1);
  m.build("skimmer", 4);
  for (let wave = 0; wave < 3; wave++) {
    assert.equal(m.wave, wave);
    m.startWave();
    for (let frame = 0; frame < 120 * fps && m.phase === "playing"; frame++) {
      m.update(1 / fps);
      if (m.enemies.some((e) => e.accelerated)) abilities.surge = true;
    }
    assert.equal(m.health, 10);
    if (wave < 2) {
      assert.equal(m.phase, "book");
      assert.ok(m.progress.unlockedChapters.includes(wave + 1));
      m.continueStory();
    } else assert.equal(m.phase, "ending");
  }
  assert.ok(abilities.disable > 0);
  assert.equal(abilities.surge, true);
  assert.deepEqual(m.progress.unlockedChapters, [1, 2]);
  for (let i = 0; i < 26 * fps; i++) m.update(1 / fps);
  assert.equal(m.phase, "message");
  assert.equal(m.health, 0);
  m.continueStory();
  assert.equal(m.phase, "book");
  m.continueStory();
  assert.equal(m.phase, "complete");
  assert.deepEqual(m.progress.unlockedChapters, [1, 2, 3]);
  console.log(
    JSON.stringify({
      fps,
      wavesSeconds: m.waveTimes.map((n) => Number(n.toFixed(2))),
      endingSeconds: 25,
      healthBeforeEnding: 10,
      chapters: m.progress.unlockedChapters,
      abilities,
      result: "complete",
    }),
  );
}
