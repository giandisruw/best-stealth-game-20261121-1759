// Every tuning number and colour for The Night Courier in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

export const PLAYER = {
  radius: 13,
  walkSpeed: 205,
  sneakSpeed: 120,
  pebbles: 5,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 72,
  suspiciousSpeed: 110,
  chaseSpeed: 175,
  /** How far a guard can see, in pixels. */
  viewRange: 235,
  /** Half-angle of the vision cone, in radians (~36 degrees each side). */
  viewHalfAngle: 0.63,
  /** Suspicion gained per second while the player is seen, at point blank. */
  suspicionRate: 95,
  /** Suspicion lost per second while the player is unseen. */
  suspicionDecay: 14,
  /** Suspicion at which a guard leaves patrol and investigates. */
  suspiciousAt: 40,
  /** Suspicion at which a guard gives chase. */
  chaseAt: 100,
  /** A player inside a bush is unseen unless a guard is this close. */
  bushRevealRange: 46,
  /** A player in a shadow zone is spotted this much slower. */
  shadowSlowdown: 0.45,
  /** Guards hear a pebble landing within this many pixels. */
  pebbleNoiseRadius: 240,
};

export const ALERT = {
  calm: { label: 'CALM', colour: '#58d68d' },
  suspicious: { label: 'SUSPICIOUS', colour: '#f5c542' },
  alerted: { label: 'ALERTED', colour: '#ff8c42' },
  chase: { label: 'CHASE!', colour: '#ff4d4d' },
};

/** Colours for the moonlit museum: deep blue floors, warm lamplight, green cover. */
export const COLOURS = {
  floorA: '#1d2b45',
  floorB: '#1a263e',
  floorLine: '#24344f',
  wall: '#4a3f35',
  wallTop: '#6b5a48',
  bush: '#2e6b3a',
  bushDark: '#1f4d29',
  shadow: 'rgba(8, 12, 28, 0.55)',
  exit: '#ffd76a',
  letter: '#f2e6c9',
  player: '#e8ecf4',
  playerCloak: '#7b2d8b',
  guard: '#c94f4f',
  guardDark: '#8e2f2f',
  coneCalm: 'rgba(88, 214, 141, 0.20)',
  coneSuspicious: 'rgba(245, 197, 66, 0.28)',
  coneAlerted: 'rgba(255, 140, 66, 0.32)',
  coneChase: 'rgba(255, 77, 77, 0.38)',
  pebble: '#b8c4d4',
};

export const LEVELS = 3;
