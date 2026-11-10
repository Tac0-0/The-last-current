import {
  BALANCE,
  ENEMIES,
  TOWERS,
  PAD_POSITIONS,
} from "../../config/balance.js";
import { WAVES } from "../../config/waves.js";
import { PathSystem } from "./PathSystem.js";
import { createTower, targetsFor, slowFor } from "./TowerSystem.js";
import { sanitizeProgress } from "../../storage/progress.js";

// The model has no DOM or Phaser dependencies. All timing uses one fixed clock.
export class RunState {
  constructor(progress, onEvent = () => {}) {
    this.path = new PathSystem();
    this.progress = sanitizeProgress(progress);
    this.onEvent = onEvent;
    this.reset("menu");
  }
  reset(phase = "prep") {
    this.phase = phase;
    this.wave = 0;
    this.health = BALANCE.health;
    this.credits = BALANCE.credits;
    this.towers = [];
    this.enemies = [];
    this.clock = 0;
    this.elapsed = 0;
    this.accumulator = 0;
    this.paused = false;
    this.overlayOpen = false;
    this.nextId = 1;
    this.spawnIndex = 0;
    this.bossDefeated = false;
    this.snapshot = null;
    this.endingTime = 0;
    this.failure = "";
    this.waveTimes = [];
    this.emit("reset");
  }
  emit(type, detail = {}) {
    this.onEvent({ type, ...detail });
  }
  get canBuild() {
    return (
      ["prep", "playing"].includes(this.phase) &&
      !this.paused &&
      !this.overlayOpen
    );
  }
  build(type, pad) {
    if (
      !this.canBuild ||
      !TOWERS[type] ||
      !Number.isInteger(pad) ||
      !PAD_POSITIONS[pad] ||
      this.towers.some((t) => t.pad === pad) ||
      this.credits < TOWERS[type].cost
    )
      return false;
    this.credits -= TOWERS[type].cost;
    this.towers.push(createTower(type, pad));
    this.emit("build");
    return true;
  }
  upgrade(pad) {
    const tower = this.towers.find((t) => t.pad === pad);
    if (
      !this.canBuild ||
      !tower ||
      tower.level ||
      this.credits < TOWERS[tower.type].upgradeCost
    )
      return false;
    const cost = TOWERS[tower.type].upgradeCost;
    this.credits -= cost;
    tower.invested += cost;
    tower.level = 1;
    this.emit("build");
    return true;
  }
  sell(pad) {
    const tower = this.towers.find((t) => t.pad === pad);
    if (!this.canBuild || !tower) return false;
    this.credits += Math.floor(tower.invested * BALANCE.sellRatio);
    this.towers = this.towers.filter((t) => t !== tower);
    this.emit("build");
    return true;
  }
  startWave() {
    if (this.phase !== "prep" || this.paused || this.overlayOpen) return false;
    // Taken after preparation: retry exactly restores this state, including upgrades.
    this.snapshot = structuredClone({
      health: this.health,
      credits: this.credits,
      towers: this.towers,
    });
    this.elapsed = 0;
    this.spawnIndex = 0;
    this.bossDefeated = false;
    this.accumulator = 0;
    this.schedule = [
      ...WAVES[this.wave].trash,
      [WAVES[this.wave].bossAt, WAVES[this.wave].boss],
    ];
    this.towers.forEach((t) => {
      t.cooldown = 0;
      t.disabledUntil = 0;
    });
    this.phase = "playing";
    this.emit("phase");
    return true;
  }
  retry() {
    if (this.phase !== "defeat" || !this.snapshot) return false;
    Object.assign(this, structuredClone(this.snapshot));
    this.towers.forEach((t) => {
      t.cooldown = 0;
      t.disabledUntil = 0;
    });
    this.enemies = [];
    this.elapsed = 0;
    this.spawnIndex = 0;
    this.accumulator = 0;
    this.bossDefeated = false;
    this.paused = false;
    this.overlayOpen = false;
    this.failure = "";
    this.phase = "prep";
    this.emit("reset");
    return true;
  }
  unlock(chapter) {
    if (!this.progress.unlockedChapters.includes(chapter)) {
      this.progress.unlockedChapters.push(chapter);
      this.progress.unlockedChapters.sort();
      this.emit("progress");
    }
  }
  continueStory() {
    if (this.phase === "book") {
      if (this.wave === 2) this.phase = "complete";
      else {
        this.wave++;
        this.phase = "prep";
      }
    } else if (this.phase === "message") {
      this.unlock(3);
      this.phase = "book";
    } else return false;
    this.emit("phase");
    return true;
  }
  skipEnding() {
    if (this.phase !== "ending") return;
    this.health = 0;
    this.endingTime = BALANCE.endingDuration;
    this.phase = "message";
    this.emit("phase");
  }
  spawn(type, distance = 0) {
    const def = ENEMIES[type];
    const enemy = {
      id: this.nextId++,
      type,
      ...def,
      maxHp: def.hp,
      distance: Math.max(0, Math.min(this.path.length - 0.01, distance)),
      abilityUsed: false,
      dead: false,
    };
    Object.assign(enemy, this.path.at(enemy.distance));
    this.enemies.push(enemy);
    if (def.boss) this.emit("boss", { enemy });
    return enemy;
  }
  damage(enemy, amount) {
    if (enemy.dead || this.phase !== "playing") return;
    enemy.hp -= amount;
    if (enemy.hp > 0) return;
    enemy.dead = true;
    this.credits += enemy.reward;
    this.emit("collect", { x: enemy.x, y: enemy.y, reward: enemy.reward });
    if (enemy.boss) {
      this.bossDefeated = true;
      if (enemy.type === "plastic")
        ["bag", "bag", "bottle"].forEach((type) =>
          this.spawn(type, enemy.distance),
        );
    }
  }
  fail(reason) {
    this.phase = "defeat";
    this.failure = reason;
    this.paused = false;
    this.emit("phase");
  }
  update(deltaSeconds) {
    if (
      this.paused ||
      this.overlayOpen ||
      !["playing", "ending"].includes(this.phase)
    )
      return;
    this.accumulator += Math.max(
      0,
      Math.min(BALANCE.maxDelta, deltaSeconds || 0),
    );
    while (this.accumulator + 1e-9 >= BALANCE.step) {
      this.accumulator -= BALANCE.step;
      if (this.phase === "ending") {
        this.endingTime += BALANCE.step;
        if (this.endingTime >= 14) this.health = 0;
        if (this.endingTime >= BALANCE.endingDuration) {
          this.phase = "message";
          this.emit("phase");
        }
      } else if (this.phase === "playing") this.tick(BALANCE.step);
      else {
        this.accumulator = 0;
        break;
      }
    }
  }
  tick(dt) {
    this.clock += dt;
    this.elapsed += dt;
    while (
      this.spawnIndex < this.schedule.length &&
      this.schedule[this.spawnIndex][0] <= this.elapsed
    ) {
      this.spawn(this.schedule[this.spawnIndex++][1]);
    }
    const surge = this.enemies.find((e) => e.type === "surge" && !e.dead);
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const accelerated =
        surge &&
        !enemy.boss &&
        Math.abs(surge.distance - enemy.distance) <= BALANCE.surgeDistance;
      enemy.accelerated = Boolean(accelerated);
      enemy.slow = slowFor(enemy, this.towers);
      enemy.distance +=
        enemy.speed *
        (1 - enemy.slow) *
        (accelerated ? BALANCE.surgeMultiplier : 1) *
        dt;
      Object.assign(enemy, this.path.at(enemy.distance));
      if (
        enemy.type === "net" &&
        !enemy.abilityUsed &&
        enemy.distance >= this.path.length * 0.45
      ) {
        enemy.abilityUsed = true;
        const nearby = this.towers
          .filter(
            (t) =>
              t.type !== "barrier" &&
              t.disabledUntil <= this.clock &&
              Math.hypot(t.x - enemy.x, t.y - enemy.y) <= BALANCE.netRadius,
          )
          .sort(
            (a, b) =>
              Math.hypot(a.x - enemy.x, a.y - enemy.y) -
              Math.hypot(b.x - enemy.x, b.y - enemy.y),
          );
        if (nearby[0]) {
          nearby[0].disabledUntil = this.clock + BALANCE.netDuration;
          this.emit("disable", { tower: nearby[0] });
        }
      }
      if (enemy.distance >= this.path.length) {
        enemy.dead = true;
        if (enemy.boss) {
          this.fail("boss");
          return;
        }
        this.health = Math.max(0, this.health - enemy.damage);
        this.emit("leak");
        if (this.health === 0) {
          this.fail("health");
          return;
        }
      }
    }
    for (const tower of this.towers) {
      if (tower.type === "barrier" || tower.disabledUntil > this.clock)
        continue;
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (tower.cooldown > 1e-8) continue;
      const targets = targetsFor(tower, this.enemies);
      if (!targets.length) continue;
      const stats = TOWERS[tower.type].levels[tower.level];
      tower.cooldown = stats.interval;
      for (const enemy of targets) {
        this.emit("shot", {
          from: { x: tower.x, y: tower.y },
          to: { x: enemy.x, y: enemy.y },
          boat: tower.type === "boat",
        });
        this.damage(enemy, stats.damage);
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
    if (
      this.spawnIndex === this.schedule.length &&
      this.bossDefeated &&
      !this.enemies.length
    ) {
      this.waveTimes[this.wave] = this.elapsed;
      if (this.wave < 2) {
        this.credits += BALANCE.waveBonus;
        this.unlock(this.wave + 1);
        this.phase = "book";
      } else {
        this.phase = "ending";
        this.endingTime = 0;
      }
      this.emit("phase");
    }
  }
}
