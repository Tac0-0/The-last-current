import { TOWERS, BALANCE, PAD_POSITIONS } from "../../config/balance.js";
export const inRange = (tower, enemy) =>
  Math.hypot(tower.x - enemy.x, tower.y - enemy.y) <= TOWERS[tower.type].range;
export const leading = (a, b) => b.distance - a.distance || a.id - b.id;
export function targetsFor(tower, enemies) {
  const possible = enemies
    .filter((e) => !e.dead && inRange(tower, e))
    .sort(leading);
  if (!possible.length || tower.type === "barrier") return [];
  if (tower.type === "skimmer") return possible.slice(0, 1);
  const center = possible[0];
  return possible
    .filter(
      (e) => Math.hypot(e.x - center.x, e.y - center.y) <= BALANCE.boatRadius,
    )
    .slice(0, 3);
}
export function slowFor(enemy, towers) {
  return towers.reduce(
    (slow, tower) =>
      tower.type === "barrier" && inRange(tower, enemy)
        ? Math.max(slow, TOWERS.barrier.levels[tower.level].slow)
        : slow,
    0,
  );
}
export function createTower(type, pad) {
  return {
    type,
    pad,
    ...PAD_POSITIONS[pad],
    level: 0,
    invested: TOWERS[type].cost,
    cooldown: 0,
    disabledUntil: 0,
  };
}
