import test from "node:test";
import assert from "node:assert/strict";
import { RunState } from "../src/game/systems/RunState.js";
import { PathSystem } from "../src/game/systems/PathSystem.js";
import {
  createTower,
  targetsFor,
  slowFor,
} from "../src/game/systems/TowerSystem.js";
import { BALANCE, PATH_POINTS } from "../src/config/balance.js";
import {
  sanitizeProgress,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from "../src/storage/progress.js";

const run = () => {
  const m = new RunState();
  m.reset();
  return m;
};
const advance = (m, seconds, fps = 60) => {
  for (let i = 0; i < seconds * fps; i++) m.update(1 / fps);
};
const isolate = (m) => {
  m.startWave();
  m.schedule = [[1000, "bottle"]];
};

test("path samples clamp to the endpoint and remain finite across the winding route", () => {
  const path = new PathSystem();
  assert.deepEqual({ x: path.at(-99).x, y: path.at(-99).y }, PATH_POINTS[0]);
  assert.deepEqual(
    { x: path.at(Infinity).x, y: path.at(Infinity).y },
    PATH_POINTS.at(-1),
  );
  for (let d = 0; d <= path.length; d += 5) {
    const p = path.at(d);
    assert.ok(Number.isFinite(p.x + p.y + p.angle));
  }
});

test("economy enforces affordability, one tower per pad, one upgrade, and floor(75%) refunds", () => {
  const m = run();
  assert.equal(m.build("skimmer", 0), true);
  assert.equal(m.credits, 55);
  assert.equal(m.build("barrier", 0), false);
  assert.equal(m.build("boat", 1), false);
  assert.equal(m.build("unknown", 1), false);
  assert.equal(m.build("barrier", 9), false);
  assert.equal(m.upgrade(0), true);
  assert.equal(m.credits, 15);
  assert.equal(m.upgrade(0), false);
  assert.equal(m.sell(0), true);
  assert.equal(m.credits, 86);
  assert.equal(m.towers.length, 0);
  assert.equal(m.sell(0), false);
});

test("focused targeting uses path distance, then spawn order, rather than x", () => {
  const tower = { ...createTower("skimmer", 1), x: 0, y: 0 };
  const enemies = [
    { id: 3, x: 80, y: 0, distance: 10 },
    { id: 2, x: 50, y: 0, distance: 40 },
    { id: 1, x: -20, y: 0, distance: 40 },
    { id: 4, x: 500, y: 0, distance: 70 },
  ];
  assert.equal(targetsFor(tower, enemies)[0].id, 1);
});

test("boat hits at most three clustered enemies within range and ignores distant targets", () => {
  const tower = { ...createTower("boat", 0), x: 0, y: 0 };
  const enemies = [0, 1, 2, 3, 4].map((i) => ({
    id: i,
    x: 150 + i * 10,
    y: 0,
    distance: 50 - i,
  }));
  enemies.push(
    { id: 9, x: -150, y: 0, distance: 1 },
    { id: 10, x: 200, y: 0, distance: 2 },
  );
  assert.deepEqual(
    targetsFor(tower, enemies).map((e) => e.id),
    [0, 1, 2],
  );
});

test("overlapping barriers use the strongest slow and deal no damage", () => {
  const a = { ...createTower("barrier", 0), x: 0, y: 0 },
    b = { ...a, level: 1 };
  const enemy = { x: 20, y: 20, distance: 0 };
  assert.equal(slowFor(enemy, [a, b]), 0.6);
  assert.deepEqual(targetsFor(b, [enemy]), []);
});

test("a killed plastic boss rewards once and creates exactly three targetable children", () => {
  const m = run();
  isolate(m);
  const boss = m.spawn("plastic", m.path.length - 5);
  m.damage(boss, 999);
  m.damage(boss, 999);
  assert.equal(m.credits, 160);
  assert.equal(m.bossDefeated, true);
  assert.deepEqual(
    m.enemies.filter((e) => !e.boss).map((e) => e.type),
    ["bag", "bag", "bottle"],
  );
  assert.ok(m.enemies.every((e) => e.distance < m.path.length));
  assert.deepEqual(m.progress.unlockedChapters, []);
});

test("trash leaks lose health and grant no currency", () => {
  const m = run();
  isolate(m);
  m.spawn("can", m.path.length - 0.1);
  advance(m, 0.1);
  assert.equal(m.health, 8);
  assert.equal(m.credits, 110);
  assert.equal(m.enemies.length, 0);
});

test("a boss leak is immediate defeat, even at full health, and never unlocks a chapter", () => {
  const m = run();
  isolate(m);
  m.spawn("net", m.path.length - 0.1);
  advance(m, 0.1);
  assert.equal(m.phase, "defeat");
  assert.equal(m.failure, "boss");
  assert.equal(m.health, 10);
  assert.equal(m.bossDefeated, false);
  assert.deepEqual(m.progress.unlockedChapters, []);
});

test("retry restores pre-wave HP, money, tower types and upgrades after mid-wave changes", () => {
  const m = run();
  m.build("skimmer", 1);
  m.upgrade(1);
  m.health = 7;
  m.unlock(1);
  m.startWave();
  const before = structuredClone(m.snapshot);
  m.sell(1);
  m.build("barrier", 4);
  m.health = 2;
  m.spawn("can", 150);
  m.fail("boss");
  assert.equal(m.retry(), true);
  assert.equal(m.health, before.health);
  assert.equal(m.credits, before.credits);
  assert.deepEqual(m.towers, before.towers);
  assert.equal(m.phase, "prep");
  assert.equal(m.enemies.length, 0);
  assert.deepEqual(m.progress.unlockedChapters, [1]);
  m.startWave();
  advance(m, 1.1);
  assert.equal(m.enemies.length, 1);
});

test("pause and journal overlays freeze all clocks, movement, spawns and cooldowns", () => {
  const m = run();
  m.build("skimmer", 1);
  m.startWave();
  advance(m, 5);
  const snapshot = () =>
    JSON.stringify([m.elapsed, m.clock, m.spawnIndex, m.enemies, m.towers]);
  let before = snapshot();
  m.paused = true;
  advance(m, 100);
  assert.equal(snapshot(), before);
  m.paused = false;
  m.overlayOpen = true;
  before = snapshot();
  advance(m, 100);
  assert.equal(snapshot(), before);
  assert.equal(m.build("barrier", 2), false);
  m.overlayOpen = false;
  advance(m, 1);
  assert.notEqual(snapshot(), before);
});

test("ghost net disables the closest damage tower once for exactly three simulation seconds", () => {
  const m = run();
  isolate(m);
  const position = m.path.at(m.path.length * 0.45);
  const barrier = { ...createTower("barrier", 0), ...position };
  const near = {
    ...createTower("skimmer", 1),
    x: position.x + 20,
    y: position.y,
    cooldown: 5,
  };
  const far = {
    ...createTower("boat", 2),
    x: position.x + 90,
    y: position.y,
    cooldown: 5,
  };
  m.towers = [barrier, near, far];
  const boss = m.spawn("net", m.path.length * 0.45);
  m.update(1 / 60);
  assert.equal(boss.abilityUsed, true);
  assert.ok(Math.abs(near.disabledUntil - m.clock - 3) < 1e-8);
  assert.equal(far.disabledUntil, 0);
  assert.equal(barrier.disabledUntil, 0);
  const until = near.disabledUntil;
  advance(m, 3.1);
  assert.ok(m.clock > until);
  assert.equal(near.disabledUntil, until);
});

test("waste surge accelerates only ordinary trash within 170 path pixels", () => {
  const m = run();
  isolate(m);
  const boss = m.spawn("surge", 700),
    close = m.spawn("can", 730),
    far = m.spawn("can", 1000);
  m.update(1 / 60);
  assert.ok(Math.abs(close.distance - 730 - (95 * 1.35) / 60) < 1e-7);
  assert.ok(Math.abs(far.distance - 1000 - 95 / 60) < 1e-7);
  assert.ok(Math.abs(boss.distance - 700 - 60 / 60) < 1e-7);
});

test("frame rates of 30 and 60 FPS produce the same wave outcome and earnings", () => {
  const results = [30, 60].map((fps) => {
    const m = run();
    m.build("skimmer", 1);
    m.build("skimmer", 4);
    m.startWave();
    advance(m, 90, fps);
    return [
      m.phase,
      m.health,
      m.credits,
      m.waveTimes,
      m.progress.unlockedChapters,
    ];
  });
  assert.deepEqual(results[0], results[1]);
  assert.equal(results[0][0], "book");
});

test("long tab inactivity is clamped rather than teleporting enemies to the endpoint", () => {
  const m = run();
  isolate(m);
  const enemy = m.spawn("bottle", 100);
  m.update(300);
  assert.ok(enemy.distance - 100 <= 13.5 + 1e-8);
  assert.equal(m.health, 10);
});

test("ending always removes Shelly, blocks purchases and unlocks chapter III only after the message", () => {
  for (const health of [1, 10]) {
    const m = run();
    m.wave = 2;
    m.health = health;
    m.startWave();
    m.schedule = [];
    m.bossDefeated = true;
    m.update(1 / 60);
    assert.equal(m.phase, "ending");
    assert.equal(m.build("barrier", 0), false);
    advance(m, 25.1);
    assert.equal(m.phase, "message");
    assert.equal(m.health, 0);
    assert.deepEqual(m.progress.unlockedChapters, []);
    m.continueStory();
    assert.equal(m.phase, "book");
    assert.deepEqual(m.progress.unlockedChapters, [3]);
    m.continueStory();
    assert.equal(m.phase, "complete");
    m.reset();
    assert.deepEqual(m.progress.unlockedChapters, [3]);
  }
});

test("skip ending goes to the final message, never past it or straight to the book", () => {
  const m = run();
  m.phase = "ending";
  m.skipEnding();
  assert.equal(m.phase, "message");
  assert.equal(m.health, 0);
  assert.deepEqual(m.progress.unlockedChapters, []);
});

test("storage is versioned, sanitized and safe when browser persistence is denied", () => {
  assert.deepEqual(
    sanitizeProgress({
      version: 1,
      unlockedChapters: [3, "1", 2, 9, 2, null],
      mute: "yes",
    }),
    { version: 1, unlockedChapters: [2, 3], mute: false },
  );
  for (const value of [
    null,
    {},
    { version: 9 },
    { version: 1, unlockedChapters: {} },
  ])
    assert.deepEqual(sanitizeProgress(value).unlockedChapters, []);
  const broken = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
  assert.equal(loadProgress(broken).mute, false);
  assert.equal(saveProgress({}, broken), false);
  const store = new Map(),
    storage = {
      getItem: (key) => store.get(key),
      setItem: (key, value) => store.set(key, value),
    };
  assert.equal(
    saveProgress({ version: 1, unlockedChapters: [1], mute: true }, storage),
    true,
  );
  assert.deepEqual(loadProgress(storage), {
    version: 1,
    unlockedChapters: [1],
    mute: true,
  });
  assert.deepEqual(Object.keys(JSON.parse(store.get(STORAGE_KEY))).sort(), [
    "mute",
    "unlockedChapters",
    "version",
  ]);
});

test("repeated restarts reset wave spawns and never duplicate rewards", () => {
  const m = run();
  for (let i = 0; i < 10; i++) {
    m.reset();
    m.startWave();
    advance(m, 1.2);
    assert.equal(m.enemies.length, 1);
    assert.equal(m.credits, 110);
  }
});
