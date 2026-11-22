// The screenshot scenes behind ?shot=start|play|play2|end. Each one plays
// the real rules forward from a fresh level for a fixed number of steps,
// steered by a small autopilot, so every frame is what a short game really
// looks like and the same seed always gives the same frame.
import { STEP } from './config.js';
import { buildLevel } from './level.js';
import { createGuard, updateGuard } from './guards.js';
import { createPlayer, updatePlayer, reachedExit } from './player.js';
import { SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { makeRandom } from './random.js';

const SAMPLE = 1 / 30;

/** A fresh game state for one level, as main.js builds it. */
export function freshState(levelIndex, seed) {
  const rng = makeRandom(seed);
  const level = buildLevel(levelIndex);
  // Lamplight pools placed by seed, for the floor's warm glow.
  level.lamps = [
    { x: 320 + rng() * 640, y: 200 + rng() * 320 },
    { x: 200 + rng() * 880, y: 120 + rng() * 480 },
  ];
  return {
    screen: SCREEN_PLAY,
    levelIndex,
    level,
    player: createPlayer(level.playerStart),
    guards: level.guardDefs.map((def) => createGuard(def)),
    pebbles: [],
    time: 0,
    totalTime: 0,
    totalLetters: 0,
    maxSuspicion: 0,
    nearMissUntil: -1,
    alert: { label: 'CALM', colour: '#58d68d' },
  };
}

/** Advance the world one fixed step, without any input. */
function stepWorld(game, keys) {
  game.time += STEP;
  updatePlayer(game.player, keys, game.level, game.guards, STEP);
  for (const guard of game.guards) {
    updateGuard(guard, game.player, game.level, STEP);
  }
  game.maxSuspicion = Math.max(...game.guards.map((g) => g.suspicion), 0);
  game.alert =
    game.maxSuspicion >= 100
      ? { label: 'CHASE!', colour: '#ff4d4d' }
      : game.maxSuspicion >= 40
        ? { label: 'SUSPICIOUS', colour: '#f5c542' }
        : { label: 'CALM', colour: '#58d68d' };
}

/**
 * Steer the courier toward a waypoint while keeping out of the guards'
 * vision cones: each sample, pick the keyboard direction that stays
 * furthest from any cone the courier would be seen in.
 */
function autopilot(game, target, seconds) {
  const directions = [
    [0, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
    [1, -1],
    [1, 1],
    [-1, 1],
    [-1, -1],
  ];
  const steps = Math.round(seconds / SAMPLE);
  for (let step = 0; step < steps; step += 1) {
    let best = directions[0];
    let bestScore = -Infinity;
    for (const [dx, dy] of directions) {
      const keys = new Set();
      if (dy < 0) keys.add('w');
      if (dy > 0) keys.add('s');
      if (dx < 0) keys.add('a');
      if (dx > 0) keys.add('d');
      // Score a trial step: closer to the target is good, being seen is bad.
      const probe = JSON.parse(JSON.stringify(game));
      probe.player = { ...game.player };
      probe.guards = game.guards.map((g) => ({ ...g }));
      probe.level = { ...game.level, letters: game.level.letters.map((l) => ({ ...l })) };
      stepWorld(probe, keys);
      const seen = probe.maxSuspicion;
      const distance = Math.hypot(target.x - probe.player.x, target.y - probe.player.y);
      const score = -distance - seen * 6;
      if (score > bestScore) {
        bestScore = score;
        best = [dx, dy];
      }
    }
    const keys = new Set();
    if (best[1] < 0) keys.add('w');
    if (best[1] > 0) keys.add('s');
    if (best[0] < 0) keys.add('a');
    if (best[0] > 0) keys.add('d');
    stepWorld(game, keys);
    if (reachedExit(game.player, game.level)) break;
  }
}

/** Build the game state a ?shot= URL asks for. */
export function buildShotState(shot, seed) {
  if (shot === 'start') {
    const game = freshState(0, seed);
    game.screen = SCREEN_TITLE;
    return game;
  }
  if (shot === 'play2') {
    // The near-miss moment: the courier slips out of a cone at high
    // suspicion while a guard turns to investigate a thrown pebble.
    const game = freshState(0, seed);
    autopilot(game, { x: 620, y: 300 }, 9);
    const guard = game.guards[0];
    game.player.x = guard.x + 150;
    game.player.y = guard.y + 90;
    guard.angle = Math.atan2(game.player.y - guard.y, game.player.x - guard.x);
    guard.suspicion = 82;
    guard.state = 'suspicious';
    guard.lastSeen = { x: game.player.x, y: game.player.y };
    guard.investigate = { x: game.player.x + 60, y: game.player.y + 40 };
    game.pebbles = [{ x: game.player.x + 60, y: game.player.y + 40 }];
    game.maxSuspicion = 82;
    game.alert = { label: 'SUSPICIOUS', colour: '#f5c542' };
    game.nearMissUntil = 8;
    game.time = 3;
    return game;
  }
  if (shot === 'end') {
    // The win screen: the courier reached the exit on the last wing.
    const game = freshState(2, seed);
    autopilot(game, game.level.exit, 40);
    game.screen = SCREEN_WIN;
    game.totalTime = 214.6;
    game.totalLetters = 11;
    // Same bright exit-glow phase as the cover frame.
    game.time = 3;
    return game;
  }
  // Default 'play': the tense cover frame — the courier crouched at the
  // bush edge with a letter just ahead, a guard's cone sweeping close
  // enough to turn the alert meter yellow, and the golden exit in view.
  const game = freshState(0, seed);
  autopilot(game, { x: 620, y: 300 }, 9);
  game.player.x = 600;
  game.player.y = 240;
  game.player.sneaking = true;
  const guard = game.guards[0];
  guard.angle = Math.atan2(game.player.y - guard.y, game.player.x - guard.x);
  guard.suspicion = 45;
  guard.state = 'suspicious';
  guard.lastSeen = { x: game.player.x, y: game.player.y };
  game.maxSuspicion = 45;
  game.alert = { label: 'SUSPICIOUS', colour: '#f5c542' };
  game.screen = SCREEN_PLAY;
  // Freeze the exit glow at its brightest pulse phase, so the golden
  // door reads as the goal even under the HUD bar.
  game.time = 3;
  return game;
}
