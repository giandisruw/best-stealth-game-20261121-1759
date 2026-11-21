// The Night Courier — main loop and game state machine.
// Screens: title -> play -> (pause) -> win / caught, with R to restart.
import { ALERT, FIELD, STEP } from './config.js';
import { buildLevel } from './level.js';
import { createGuard, updateGuard } from './guards.js';
import { createPlayer, updatePlayer, throwPebble, reachedExit, caughtByGuard } from './player.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { fitCanvas, resizeCanvas, render, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSE, SCREEN_WIN, SCREEN_CAUGHT } from './render.js';
import { buildShotState, freshState } from './shots.js';
import { makeRandom } from './random.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const audio = createAudio();
const input = createInput(canvas);

let game = null;
let warnedAt = false;

function alertFor(suspicion) {
  if (suspicion >= 100) return ALERT.chase;
  if (suspicion >= 40) return ALERT.suspicious;
  if (suspicion >= 25) return ALERT.alerted;
  return ALERT.calm;
}

function startLevel(levelIndex, keepTotals) {
  const previous = game;
  const rng = makeRandom(20261121 + levelIndex);
  const level = buildLevel(levelIndex);
  level.lamps = [
    { x: 320 + rng() * 640, y: 200 + rng() * 320 },
    { x: 200 + rng() * 880, y: 120 + rng() * 480 },
  ];
  game = {
    screen: SCREEN_PLAY,
    levelIndex,
    level,
    player: createPlayer(level.playerStart),
    guards: level.guardDefs.map((def) => createGuard(def)),
    pebbles: [],
    time: 0,
    totalTime: keepTotals ? previous.totalTime : 0,
    totalLetters: keepTotals ? previous.totalLetters : 0,
    maxSuspicion: 0,
    nearMissUntil: -1,
    alert: ALERT.calm,
  };
  warnedAt = false;
  announce(`${level.name}. ${level.hint}`);
}

function startGame() {
  game = null;
  startLevel(0, false);
}

function announce(text) {
  if (status) status.textContent = text;
}

/** Advance one fixed step while playing. */
function step(dt) {
  if (!game || game.screen !== SCREEN_PLAY) return;
  game.time += STEP;
  const footstep = updatePlayer(game.player, input.keys, game.level, game.guards, STEP);
  if (footstep === 'footstep') audio.footstep(game.player.sneaking);

  let chaseStarted = false;
  for (const guard of game.guards) {
    const event = updateGuard(guard, game.player, game.level, STEP);
    if (event === 'spotted' && !chaseStarted) {
      chaseStarted = true;
      audio.sting();
      announce('Spotted! A guard is chasing you — break line of sight!');
    }
    if (event === 'nearMiss') {
      game.nearMissUntil = game.time + 2.5;
      announce('Close one — they almost saw you.');
    }
  }

  game.maxSuspicion = Math.max(...game.guards.map((g) => g.suspicion), 0);
  const previousAlert = game.alert;
  game.alert = alertFor(game.maxSuspicion);
  if (!warnedAt && game.maxSuspicion >= 50 && game.maxSuspicion < 100) {
    warnedAt = true;
    audio.warning();
  }
  if (game.maxSuspicion < 50) warnedAt = false;
  if (previousAlert !== game.alert && game.alert === ALERT.suspicious) {
    announce('A guard is suspicious — hide!');
  }

  if (reachedExit(game.player, game.level)) {
    game.totalTime += game.time;
    game.totalLetters += game.player.letters;
    audio.win();
    if (game.levelIndex + 1 < 3) {
      announce(`${game.level.name} cleared — on to the next wing.`);
      startLevel(game.levelIndex + 1, true);
    } else {
      game.screen = SCREEN_WIN;
      announce(`Delivered! All three wings crossed in ${game.totalTime.toFixed(1)} seconds.`);
    }
    return;
  }

  if (caughtByGuard(game.player, game.guards)) {
    game.screen = SCREEN_CAUGHT;
    audio.caught();
    announce('Caught! Press R to try this wing again.');
  }
}

function draw() {
  const { scale, offsetX, offsetY } = fitCanvas(canvas);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#070a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  render(ctx, game);
}

let lastTime = 0;
let accumulator = 0;

function frame(timestamp) {
  const delta = Math.min(0.1, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;
  accumulator += delta;
  while (accumulator >= STEP) {
    step(STEP);
    accumulator -= STEP;
  }
  draw();
  requestAnimationFrame(frame);
}

function begin() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') ?? 1) || 1;
  if (shot) {
    // A staged screenshot: render one deterministic frame and stop.
    // Size the canvas to the window first, or the 300x150 default would
    // be stretched by CSS and the frame would come out blurry.
    resizeCanvas(canvas);
    game = buildShotState(shot, seed);
    draw();
    return;
  }
  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));
  startGame();
  game.screen = SCREEN_TITLE;
  announce('The Night Courier. Press Enter or click to begin.');
  requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    requestAnimationFrame(frame);
  });
}

input.onKey = (key) => {
  audio.ensure();
  if (!game) return;
  if (key === 'enter' && game.screen === SCREEN_TITLE) {
    game.screen = SCREEN_PLAY;
    return;
  }
  if (key === 'p' && (game.screen === SCREEN_PLAY || game.screen === SCREEN_PAUSE)) {
    game.screen = game.screen === SCREEN_PLAY ? SCREEN_PAUSE : SCREEN_PLAY;
    return;
  }
  if (key === 'r' && (game.screen === SCREEN_CAUGHT || game.screen === SCREEN_WIN)) {
    startGame();
    return;
  }
  if (key === 'r' && game.screen === SCREEN_PLAY) {
    startLevel(game.levelIndex, true);
    return;
  }
  if (key === 'm') {
    audio.muted = !audio.muted;
  }
};

input.onClick = (point) => {
  audio.ensure();
  if (!game) return;
  if (game.screen === SCREEN_TITLE) {
    game.screen = SCREEN_PLAY;
    return;
  }
  if (game.screen === SCREEN_PAUSE) {
    game.screen = SCREEN_PLAY;
    return;
  }
  if (game.screen !== SCREEN_PLAY) return;
  game.player.moveTarget = point;
};

input.onRightClick = (point) => {
  audio.ensure();
  if (!game || game.screen !== SCREEN_PLAY) return;
  if (throwPebble(game.player, game.guards, point.x, point.y)) {
    game.pebbles.push({ x: point.x, y: point.y });
    audio.pebble();
    announce('Pebble thrown — a guard goes to look.');
  }
};

// Exposed for play-testing from the console.
window.__courier = {
  get game() {
    return game;
  },
  startGame,
  startLevel,
};

begin();
