import Phaser from "phaser";
import { PAD_POSITIONS, TOWERS, ENEMIES } from "../../config/balance.js";
import { bg } from "../../config/localeBg.js";

export class GameScene extends Phaser.Scene {
  constructor(model, view) {
    super("ocean");
    this.model = model;
    this.view = view;
    this.sprites = new Map();
    this.effects = [];
    this.visualTime = 0;
  }
  preload() {
    for (const name of [
      "ocean",
      "turtle",
      ...Object.keys(TOWERS),
      ...Object.keys(ENEMIES),
    ]) {
      const size =
        name === "ocean"
          ? { width: 1280, height: 720 }
          : name === "turtle"
            ? { width: 320, height: 260 }
            : { width: 120, height: 120 };
      this.load.svg(name, `./assets/art/${name}.svg`, size);
    }
    this.load.on("loaderror", () => this.view.error?.());
  }
  create() {
    this.add.image(640, 360, "ocean").setDisplaySize(1280, 720);
    this.river = this.add.graphics();
    for (const [width, color, alpha] of [
      [122, 0x4d8c8c, 0.1],
      [87, 0x71b4ac, 0.08],
      [47, 0xa4cfc1, 0.04],
    ]) {
      this.river.lineStyle(width, color, alpha);
      this.river.beginPath();
      this.model.path.samples.forEach((p, i) =>
        i ? this.river.lineTo(p.x, p.y) : this.river.moveTo(p.x, p.y),
      );
      this.river.strokePath();
    }
    this.details = this.add.graphics();
    this.range = this.add.graphics();
    this.padArt = this.add.graphics();
    this.padLabels = PAD_POSITIONS.map((p, i) => {
      this.add
        .zone(p.x, p.y, 78, 78)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.view.onPad(i))
        .on("pointerover", () => {
          this.view.hoverPad = i;
        })
        .on("pointerout", () => {
          this.view.hoverPad = null;
        });
      return this.add
        .text(p.x, p.y, String(i + 1).padStart(2, "0"), {
          fontFamily: "Georgia, serif",
          fontSize: "21px",
          color: "#a5bfb2",
        })
        .setOrigin(0.5);
    });
    this.turtle = this.add
      .image(1170, 325, "turtle")
      .setDisplaySize(140, 114)
      .setRotation(-0.13);
    this.turtleLabel = this.add
      .text(1170, 399, bg.shelly, {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#ced8be",
      })
      .setOrigin(0.5);
    this.effectGraphics = this.add.graphics().setDepth(5);
    this.endingGraphics = this.add.graphics().setDepth(10);
    this.game.canvas.setAttribute("aria-label", bg.canvasLabel);
    this.game.canvas.setAttribute("role", "img");
    this.view.ready?.();
  }
  effect(event) {
    if (["shot", "collect", "leak", "disable"].includes(event.type))
      this.effects.push({ ...event, age: 0 });
    if (event.type === "reset") {
      this.effects.forEach((effect) => effect.text?.destroy());
      this.effects = [];
      this.visualTime = 0;
    }
  }
  update(_, delta) {
    const m = this.model;
    m.update(delta / 1000);
    const frozen =
      m.paused ||
      m.overlayOpen ||
      ["book", "defeat", "message", "complete"].includes(m.phase);
    const dt = frozen ? 0 : Math.min(delta / 1000, 0.1);
    this.visualTime += dt;
    this.drawCurrent();
    this.drawPads();
    this.drawEntities();
    this.drawEffects(dt);
    this.drawEnding();
    this.turtle.setPosition(
      1170,
      325 + (this.view.reducedMotion ? 0 : Math.sin(this.visualTime * 1.3) * 2),
    );
    this.view.refresh();
  }
  drawCurrent() {
    const g = this.details.clear();
    const motion = this.view.reducedMotion ? 0 : this.visualTime * 24;
    for (let i = 0; i < 36; i++) {
      const p = this.model.path.at(
        ((i * this.model.path.length) / 36 + motion) % this.model.path.length,
      );
      const offset = ((i % 3) - 1) * 23;
      const x = p.x - Math.sin(p.angle) * offset,
        y = p.y + Math.cos(p.angle) * offset;
      g.lineStyle(1, 0xbadcc7, 0.16);
      g.lineBetween(
        x,
        y,
        x + Math.cos(p.angle) * 14,
        y + Math.sin(p.angle) * 14,
      );
    }
    // Distant debris remains even after successful cleanup; it grows between waves.
    for (let i = 0; i < 7 + this.model.wave * 9; i++) {
      const x = 500 + ((i * 83) % 740),
        y = 110 + ((i * 19) % 35);
      g.fillStyle(0x5b827c, 0.28);
      g.fillRoundedRect(x, y, 7 + (i % 9), 4, 2);
    }
  }
  drawPads() {
    const g = this.padArt.clear(),
      range = this.range.clear(),
      m = this.model;
    PAD_POSITIONS.forEach((p, i) => {
      const tower = m.towers.find((t) => t.pad === i);
      const selected = this.view.selectedPad === i;
      g.fillStyle(0x0b323c, 0.8);
      g.fillCircle(p.x, p.y, 31);
      g.lineStyle(
        selected ? 2 : 1,
        selected ? 0xe2d7a8 : 0x8aafa2,
        selected ? 1 : 0.38,
      );
      g.strokeCircle(p.x, p.y, 31);
      g.lineStyle(1, 0x91baa6, 0.13);
      g.strokeCircle(p.x, p.y, 37);
      this.padLabels[i].setVisible(!tower);
      if (tower) {
        if (tower.level) {
          g.fillStyle(0xdac98b, 1);
          g.fillCircle(p.x + 25, p.y - 24, 5);
        }
        if (tower.disabledUntil > m.clock) {
          g.lineStyle(2, 0xc6b4a1, 0.9);
          g.lineBetween(p.x - 21, p.y - 20, p.x + 21, p.y + 20);
          g.lineBetween(p.x + 21, p.y - 20, p.x - 21, p.y + 20);
        }
      }
      if ((selected || this.view.hoverPad === i) && m.canBuild) {
        const type = tower?.type ?? this.view.selectedType;
        if (type) {
          range.fillStyle(0xb8d5b0, 0.035);
          range.fillCircle(p.x, p.y, TOWERS[type].range);
          range.lineStyle(1, 0xd1dab3, 0.25);
          range.strokeCircle(p.x, p.y, TOWERS[type].range);
        }
      }
    });
  }
  drawEntities() {
    const alive = new Set();
    for (const tower of this.model.towers) {
      const key = `tower-${tower.pad}`;
      alive.add(key);
      let sprite = this.sprites.get(key);
      if (!sprite) {
        sprite = this.add.image(tower.x, tower.y, tower.type).setDepth(2);
        this.sprites.set(key, sprite);
      }
      sprite
        .setTexture(tower.type)
        .setDisplaySize(66, 66)
        .setAlpha(tower.disabledUntil > this.model.clock ? 0.35 : 1);
    }
    for (const enemy of this.model.enemies) {
      const key = `enemy-${enemy.id}`;
      alive.add(key);
      let sprite = this.sprites.get(key);
      if (!sprite) {
        sprite = this.add.image(enemy.x, enemy.y, enemy.type).setDepth(3);
        this.sprites.set(key, sprite);
      }
      sprite
        .setPosition(enemy.x, enemy.y)
        .setDisplaySize(enemy.size, enemy.size)
        .setRotation(enemy.angle * 0.25);
      if (enemy.accelerated) {
        this.details.lineStyle(2, 0xe6c181, 0.45);
        this.details.strokeCircle(enemy.x, enemy.y, enemy.size * 0.7);
      }
      if (enemy.hp < enemy.maxHp) {
        this.details.fillStyle(0x082630, 0.9);
        this.details.fillRect(
          enemy.x - 16,
          enemy.y - enemy.size / 2 - 8,
          32,
          3,
        );
        this.details.fillStyle(enemy.boss ? 0xd6b77f : 0xb4c7a4, 1);
        this.details.fillRect(
          enemy.x - 16,
          enemy.y - enemy.size / 2 - 8,
          32 * Math.max(0, enemy.hp / enemy.maxHp),
          3,
        );
      }
    }
    for (const [key, sprite] of this.sprites)
      if (!alive.has(key)) {
        sprite.destroy();
        this.sprites.delete(key);
      }
  }
  drawEffects(dt) {
    const g = this.effectGraphics.clear();
    for (const effect of this.effects) {
      effect.age += dt;
      const alpha = Math.max(0, 1 - effect.age / 0.65);
      if (effect.type === "shot") {
        g.lineStyle(
          effect.boat ? 3 : 1.5,
          effect.boat ? 0xc8ba86 : 0xd4e1b9,
          alpha * 0.6,
        );
        g.lineBetween(effect.from.x, effect.from.y, effect.to.x, effect.to.y);
        g.lineStyle(1, 0xd0dcaf, alpha);
        g.strokeCircle(effect.to.x, effect.to.y, 5 + effect.age * 20);
      } else if (effect.type === "collect") {
        g.lineStyle(1.5, 0xd8d4a4, alpha);
        g.strokeCircle(effect.x, effect.y, 8 + effect.age * 26);
        if (!effect.text)
          effect.text = this.add
            .text(effect.x, effect.y - 12, `+${effect.reward}`, {
              fontFamily: "sans-serif",
              fontSize: "17px",
              color: "#e1deaf",
            })
            .setOrigin(0.5)
            .setDepth(6);
        effect.text.setAlpha(alpha).setY(effect.y - 12 - effect.age * 25);
      } else if (effect.type === "leak") {
        g.lineStyle(4, 0xc99b89, alpha);
        g.strokeCircle(1170, 325, 60 + effect.age * 40);
      }
    }
    this.effects = this.effects.filter((effect) => {
      if (effect.age < 0.65) return true;
      effect.text?.destroy();
      return false;
    });
  }
  drawEnding() {
    const m = this.model,
      g = this.endingGraphics.clear();
    const lost =
      ["message", "complete"].includes(m.phase) ||
      (m.phase === "book" && m.wave === 2) ||
      (m.phase === "ending" && m.endingTime >= 14);
    this.turtle.setVisible(!lost);
    this.turtleLabel.setVisible(!lost);
    if (m.phase !== "ending") {
      if (lost) {
        g.fillStyle(0x020d13, 1);
        g.fillRect(0, 0, 1280, 720);
      }
      return;
    }
    const t = m.endingTime;
    g.fillStyle(0x041720, Math.min(0.68, Math.max(0, (t - 3) / 12)));
    g.fillRect(0, 0, 1280, 720);
    if (t >= 6) {
      const front = Math.min(1400, (t - 6) * 160);
      g.fillStyle(0x183839, 0.98);
      g.fillRect(0, 168, front - 20, 390);
      for (let i = 0; i < 180; i++) {
        const x = front - ((i * 137) % 1420),
          y = 180 + ((i * 71) % 365);
        if (x < -40) continue;
        g.fillStyle([0x3e5751, 0x637467, 0x879080, 0x415e62][i % 4], 1);
        g.fillRoundedRect(x, y, 16 + (i % 22), 10 + (i % 15), 3);
        if (i % 4 === 0) {
          g.lineStyle(1, 0xb9b397, 0.3);
          g.lineBetween(x, y, x + 24, y + 18);
        }
      }
      if (t < 13) {
        for (const tower of m.towers) {
          g.lineStyle(1, 0xd7cda2, 0.25);
          g.lineBetween(
            tower.x,
            tower.y,
            Math.max(0, front - 25),
            tower.y + Math.sin(t * 5) * 25,
          );
        }
      }
    }
    if (t >= 14) {
      g.fillStyle(0x020d13, Math.min(1, (t - 14) / 3));
      g.fillRect(0, 0, 1280, 720);
    }
  }
}
