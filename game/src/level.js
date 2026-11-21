// The three wings of the moonlit museum. Each level is plain data: walls that
// block sight and movement, bushes and shadow zones that hide the courier,
// letters to collect, guard patrol routes, the exit door and the start spot.
// Rects are {x, y, w, h} in the 1280x720 logical field; the outer border is
// a wall in every level and is added by buildLevel, not listed here.

export const LEVELS = [
  {
    name: 'Wing I — The Quiet Gallery',
    hint: 'Slip past the patrols. Bushes hide you; reach the golden door.',
    parSeconds: 75,
    playerStart: { x: 70, y: 645 },
    exit: { x: 1184, y: 36, w: 72, h: 64 },
    walls: [
      { x: 300, y: 180, w: 200, h: 28 },
      { x: 700, y: 400, w: 220, h: 28 },
      { x: 480, y: 480, w: 28, h: 160 },
      { x: 950, y: 140, w: 28, h: 180 },
    ],
    bushes: [
      { x: 180, y: 300, w: 120, h: 80 },
      { x: 820, y: 520, w: 140, h: 70 },
      { x: 560, y: 110, w: 120, h: 70 },
    ],
    shadows: [
      { x: 96, y: 540, w: 210, h: 110 },
      { x: 1000, y: 420, w: 180, h: 120 },
    ],
    letters: [
      { x: 620, y: 300 },
      { x: 1080, y: 210 },
      { x: 380, y: 600 },
    ],
    guards: [
      {
        waypoints: [
          { x: 350, y: 92 },
          { x: 900, y: 92 },
          { x: 900, y: 300 },
          { x: 350, y: 300 },
        ],
        speed: 70,
        pauseSeconds: 1.2,
      },
      {
        waypoints: [
          { x: 600, y: 600 },
          { x: 1100, y: 600 },
          { x: 1100, y: 440 },
          { x: 600, y: 440 },
        ],
        speed: 82,
        pauseSeconds: 0.8,
      },
    ],
  },
  {
    name: 'Wing II — The Marble Hall',
    hint: 'Three guards now, tighter patrols. The shadows are your friends.',
    parSeconds: 95,
    playerStart: { x: 70, y: 70 },
    exit: { x: 1184, y: 620, w: 72, h: 64 },
    walls: [
      { x: 220, y: 200, w: 28, h: 220 },
      { x: 420, y: 120, w: 260, h: 28 },
      { x: 760, y: 300, w: 28, h: 220 },
      { x: 900, y: 520, w: 240, h: 28 },
      { x: 560, y: 480, w: 180, h: 28 },
    ],
    bushes: [
      { x: 120, y: 420, w: 130, h: 80 },
      { x: 520, y: 220, w: 120, h: 70 },
      { x: 980, y: 140, w: 130, h: 80 },
      { x: 700, y: 600, w: 140, h: 70 },
    ],
    shadows: [
      { x: 300, y: 480, w: 200, h: 110 },
      { x: 960, y: 300, w: 200, h: 110 },
    ],
    letters: [
      { x: 340, y: 620 },
      { x: 880, y: 110 },
      { x: 620, y: 380 },
      { x: 1120, y: 380 },
    ],
    guards: [
      {
        waypoints: [
          { x: 320, y: 110 },
          { x: 960, y: 110 },
          { x: 960, y: 260 },
          { x: 320, y: 260 },
        ],
        speed: 85,
        pauseSeconds: 0.9,
      },
      {
        waypoints: [
          { x: 480, y: 620 },
          { x: 480, y: 360 },
          { x: 860, y: 360 },
          { x: 860, y: 620 },
        ],
        speed: 95,
        pauseSeconds: 0.7,
      },
      {
        waypoints: [
          { x: 1060, y: 200 },
          { x: 1060, y: 560 },
          { x: 1180, y: 560 },
          { x: 1180, y: 200 },
        ],
        speed: 78,
        pauseSeconds: 1.4,
      },
    ],
  },
  {
    name: 'Wing III — The Vault Wing',
    hint: 'Four guards, short patrols, long sightlines. One clean run wins it.',
    parSeconds: 120,
    playerStart: { x: 640, y: 660 },
    exit: { x: 604, y: 28, w: 72, h: 56 },
    walls: [
      { x: 180, y: 160, w: 240, h: 28 },
      { x: 860, y: 160, w: 240, h: 28 },
      { x: 180, y: 500, w: 28, h: 150 },
      { x: 1072, y: 500, w: 28, h: 150 },
      { x: 480, y: 320, w: 320, h: 28 },
      { x: 620, y: 120, w: 28, h: 120 },
    ],
    bushes: [
      { x: 90, y: 300, w: 120, h: 80 },
      { x: 1070, y: 300, w: 120, h: 80 },
      { x: 560, y: 540, w: 160, h: 70 },
      { x: 560, y: 110, w: 160, h: 60 },
    ],
    shadows: [
      { x: 280, y: 560, w: 200, h: 100 },
      { x: 800, y: 560, w: 200, h: 100 },
      { x: 90, y: 110, w: 170, h: 100 },
      { x: 1020, y: 110, w: 170, h: 100 },
    ],
    letters: [
      { x: 120, y: 640 },
      { x: 1160, y: 640 },
      { x: 640, y: 250 },
      { x: 300, y: 420 },
      { x: 980, y: 420 },
    ],
    guards: [
      {
        waypoints: [
          { x: 240, y: 100 },
          { x: 640, y: 100 },
          { x: 640, y: 260 },
          { x: 240, y: 260 },
        ],
        speed: 95,
        pauseSeconds: 0.7,
      },
      {
        waypoints: [
          { x: 1040, y: 100 },
          { x: 1040, y: 260 },
          { x: 640, y: 260 },
          { x: 640, y: 100 },
        ],
        speed: 95,
        pauseSeconds: 0.7,
      },
      {
        waypoints: [
          { x: 300, y: 620 },
          { x: 980, y: 620 },
          { x: 980, y: 460 },
          { x: 300, y: 460 },
        ],
        speed: 105,
        pauseSeconds: 0.5,
      },
      {
        waypoints: [
          { x: 640, y: 420 },
          { x: 420, y: 420 },
          { x: 420, y: 580 },
          { x: 860, y: 580 },
          { x: 860, y: 420 },
        ],
        speed: 88,
        pauseSeconds: 0.9,
      },
    ],
  },
];

/** The border walls every level shares, as four rects. */
export function borderWalls() {
  const t = 24;
  return [
    { x: 0, y: 0, w: 1280, h: t },
    { x: 0, y: 720 - t, w: 1280, h: t },
    { x: 0, y: 0, w: t, h: 720 },
    { x: 1280 - t, y: 0, w: t, h: 720 },
  ];
}

/** Turn a level's plain data into the live state a run plays with. */
export function buildLevel(index) {
  const def = LEVELS[index];
  return {
    index,
    name: def.name,
    hint: def.hint,
    parSeconds: def.parSeconds,
    walls: [...borderWalls(), ...def.walls],
    bushes: def.bushes.map((b) => ({ ...b })),
    shadows: def.shadows.map((s) => ({ ...s })),
    letters: def.letters.map((letter) => ({ ...letter, taken: false })),
    exit: { ...def.exit },
    playerStart: { ...def.playerStart },
    guardDefs: def.guards,
  };
}

/** True when the point is inside any rect of the list. */
export function pointInRects(x, y, rects) {
  for (const rect of rects) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return true;
  }
  return false;
}

/** True when the point is inside the rect. */
export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
