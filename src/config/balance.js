export const BALANCE = {
  health: 10,
  credits: 110,
  waveBonus: 25,
  sellRatio: 0.75,
  step: 1 / 60,
  maxDelta: 0.1,
  boatRadius: 85,
  netRadius: 200,
  netDuration: 3,
  surgeDistance: 170,
  surgeMultiplier: 1.35,
  endingDuration: 25,
};
export const TOWERS = {
  barrier: {
    cost: 35,
    range: 160,
    upgradeCost: 25,
    levels: [{ slow: 0.4 }, { slow: 0.6 }],
  },
  skimmer: {
    cost: 55,
    range: 195,
    upgradeCost: 40,
    levels: [
      { damage: 15, interval: 0.8 },
      { damage: 23, interval: 0.75 },
    ],
  },
  boat: {
    cost: 85,
    range: 190,
    upgradeCost: 60,
    levels: [
      { damage: 18, interval: 2 },
      { damage: 26, interval: 1.8 },
    ],
  },
};
export const ENEMIES = {
  bottle: { hp: 25, speed: 135, reward: 10, damage: 1, size: 22 },
  bag: { hp: 15, speed: 180, reward: 12, damage: 1, size: 24 },
  can: { hp: 45, speed: 95, reward: 18, damage: 2, size: 22 },
  plastic: { hp: 130, speed: 65, reward: 50, boss: true, size: 58 },
  net: { hp: 175, speed: 70, reward: 70, boss: true, size: 76 },
  surge: { hp: 265, speed: 60, reward: 90, boss: true, size: 90 },
};
export const PAD_POSITIONS = [
  { x: 210, y: 245 },
  { x: 370, y: 335 },
  { x: 555, y: 335 },
  { x: 680, y: 345 },
  { x: 865, y: 365 },
  { x: 1005, y: 440 },
];
export const PATH_POINTS = [
  { x: -30, y: 355 },
  { x: 170, y: 355 },
  { x: 330, y: 220 },
  { x: 505, y: 220 },
  { x: 660, y: 478 },
  { x: 815, y: 478 },
  { x: 970, y: 325 },
  { x: 1110, y: 325 },
];
