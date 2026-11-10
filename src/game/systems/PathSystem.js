import { PATH_POINTS } from "../../config/balance.js";
const catmull = (a, b, c, d, t) =>
  0.5 *
  (2 * b +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t * t +
    (-a + 3 * b - 3 * c + d) * t * t * t);
export class PathSystem {
  constructor(points = PATH_POINTS) {
    this.samples = [];
    this.length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      for (let j = 0; j < 24; j++) {
        const p = [
          points[Math.max(0, i - 1)],
          points[i],
          points[i + 1],
          points[Math.min(points.length - 1, i + 2)],
        ];
        this.add({
          x: catmull(...p.map((v) => v.x), j / 24),
          y: catmull(...p.map((v) => v.y), j / 24),
        });
      }
    }
    this.add(points.at(-1));
  }
  add(p) {
    const prev = this.samples.at(-1);
    if (prev) this.length += Math.hypot(p.x - prev.x, p.y - prev.y);
    this.samples.push({ ...p, distance: this.length });
  }
  at(distance) {
    const d = Math.max(0, Math.min(this.length, distance));
    let low = 1,
      high = this.samples.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (this.samples[mid].distance < d) low = mid + 1;
      else high = mid;
    }
    const a = this.samples[low - 1],
      b = this.samples[low];
    const t = (d - a.distance) / (b.distance - a.distance || 1);
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }
}
