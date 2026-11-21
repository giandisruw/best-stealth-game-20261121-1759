// Drawing: the moonlit museum floor, walls, cover, vision cones, the
// courier, the guards, the HUD, and the title / win / caught / pause screens.
// Everything is drawn with canvas shapes — no images, no fonts from the web.
import { COLOURS, FIELD, GUARD } from './config.js';
import { coneColour } from './guards.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_WIN = 'win';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_DONE = 'done';

const PLAYER_RADIUS = 13;

/** Fit the 1280x720 field into the canvas and return the scale used. */
export function fitCanvas(canvas) {
  const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
  const offsetX = (canvas.width - FIELD.width * scale) / 2;
  const offsetY = (canvas.height - FIELD.height * scale) / 2;
  return { scale, offsetX, offsetY };
}

export function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawFloor(ctx, level) {
  const tile = 80;
  for (let y = 0; y < FIELD.height; y += tile) {
    for (let x = 0; x < FIELD.width; x += tile) {
      ctx.fillStyle = (x / tile + y / tile) % 2 === 0 ? COLOURS.floorA : COLOURS.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = COLOURS.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD.height);
    ctx.stroke();
  }
  for (let y = 0; y <= FIELD.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  // Warm pools of lamplight on the floor.
  ctx.fillStyle = 'rgba(255, 214, 120, 0.05)';
  for (const lamp of level.lamps ?? []) {
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 110, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRect(ctx, rect, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  }
}

function drawBush(ctx, bush) {
  drawRect(ctx, bush, COLOURS.bushDark, COLOURS.bush);
  ctx.fillStyle = COLOURS.bush;
  const blobs = 5;
  for (let i = 0; i < blobs; i += 1) {
    const bx = bush.x + ((i * 37 + 19) % bush.w);
    const by = bush.y + ((i * 53 + 23) % bush.h);
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVisionCone(ctx, guard) {
  const half = GUARD.viewHalfAngle;
  const range = GUARD.viewRange;
  ctx.fillStyle = coneColour(guard.state);
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, range, guard.angle - half, guard.angle + half);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = coneColour(guard.state).replace(/0\.\d+\)/, '0.7)');
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuard(ctx, guard) {
  drawVisionCone(ctx, guard);
  ctx.fillStyle = guard.state === 'chase' ? '#ff6b6b' : COLOURS.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLOURS.guardDark;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Facing tick and a little helmet brim.
  ctx.strokeStyle = '#f2e6c9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.angle) * (GUARD.radius + 6), guard.y + Math.sin(guard.angle) * (GUARD.radius + 6));
  ctx.stroke();
  // Suspicion arc above the guard's head.
  if (guard.suspicion > 2) {
    ctx.strokeStyle = guard.suspicion >= 100 ? '#ff4d4d' : guard.suspicion >= 40 ? '#f5c542' : '#58d68d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius + 9, -Math.PI / 2, -Math.PI / 2 + (guard.suspicion / 100) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawPlayer(ctx, player, time) {
  // Click target marker.
  if (player.moveTarget) {
    ctx.strokeStyle = 'rgba(232, 236, 244, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.moveTarget.x, player.moveTarget.y, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  const bob = Math.sin(time * 8) * 1.5;
  ctx.fillStyle = COLOURS.playerCloak;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLOURS.player;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hooded head and a small satchel.
  ctx.fillStyle = COLOURS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y + bob - 3, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(player.x + 8, player.y + bob + 6, 3, 0, Math.PI * 2);
  ctx.fill();
  if (player.hidden) {
    ctx.fillStyle = 'rgba(46, 107, 58, 0.45)';
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS + 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLetter(ctx, letter, time) {
  const lift = Math.sin(time * 3 + letter.x) * 3;
  ctx.fillStyle = COLOURS.letter;
  ctx.save();
  ctx.translate(letter.x, letter.y + lift);
  ctx.rotate(-0.2);
  ctx.fillRect(-9, -6, 18, 12);
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-9, -6, 18, 12);
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.lineTo(0, 2);
  ctx.lineTo(9, -6);
  ctx.stroke();
  ctx.restore();
}

function drawExit(ctx, exit, time) {
  const glow = 0.55 + Math.sin(time * 2.5) * 0.2;
  ctx.fillStyle = `rgba(255, 215, 106, ${glow})`;
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 + 5);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('▲ door ▲', exit.x + exit.w / 2, exit.y - 8);
}

function drawPebbles(ctx, pebbles) {
  for (const pebble of pebbles) {
    ctx.fillStyle = COLOURS.pebble;
    ctx.beginPath();
    ctx.arc(pebble.x, pebble.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The whole level: floor, cover, exit, letters, guards, courier. */
export function drawWorld(ctx, game) {
  const { level, player, guards, pebbles, time } = game;
  drawFloor(ctx, level);
  for (const shadow of level.shadows) {
    drawRect(ctx, shadow, COLOURS.shadow, null);
  }
  drawExit(ctx, level.exit, time);
  for (const letter of level.letters) {
    if (!letter.taken) drawLetter(ctx, letter, time);
  }
  for (const bush of level.bushes) drawBush(ctx, bush);
  for (const wall of level.walls) {
    drawRect(ctx, wall, COLOURS.wall, COLOURS.wallTop);
  }
  drawPebbles(ctx, pebbles);
  for (const guard of guards) drawGuard(ctx, guard);
  drawPlayer(ctx, player, time);
}

/** Top bar: alert level, objective, timer, level name, pebbles. */
export function drawHud(ctx, game) {
  const { alert, level, player, time, levelIndex } = game;
  ctx.fillStyle = 'rgba(8, 12, 28, 0.72)';
  ctx.fillRect(0, 0, FIELD.width, 44);
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = alert.colour;
  ctx.fillText(`● ${alert.label}`, 16, 29);
  // Alert meter.
  ctx.fillStyle = '#0c1220';
  ctx.fillRect(150, 14, 170, 16);
  ctx.fillStyle = alert.colour;
  ctx.fillRect(150, 14, 170 * Math.min(1, game.maxSuspicion / 100), 16);
  ctx.strokeStyle = 'rgba(232, 236, 244, 0.5)';
  ctx.strokeRect(150, 14, 170, 16);

  ctx.fillStyle = '#e8ecf4';
  ctx.font = '15px sans-serif';
  ctx.fillText(
    `${level.name}  •  Letters ${player.letters}/${level.letters.length}  •  Pebbles ${player.pebbles}`,
    340,
    29,
  );
  ctx.textAlign = 'right';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  ctx.fillText(`⏱ ${minutes}:${seconds}   Wing ${levelIndex + 1}/3`, FIELD.width - 16, 29);
  ctx.textAlign = 'left';

  if (game.nearMissUntil > time) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLOSE ONE! — they almost saw you', FIELD.width / 2, 84);
    ctx.textAlign = 'left';
  }
  if (player.hidden) {
    ctx.fillStyle = '#9fe8b4';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Hidden in the bushes', 16, 68);
  }
}

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(6, 9, 20, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
}

function centredText(ctx, lines) {
  let y = 190;
  for (const line of lines) {
    ctx.fillStyle = line.colour ?? '#e8ecf4';
    ctx.font = line.font;
    ctx.textAlign = 'center';
    ctx.fillText(line.text, FIELD.width / 2, y);
    y += line.gap ?? 44;
  }
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, game) {
  drawWorld(ctx, game);
  dimScreen(ctx);
  centredText(ctx, [
    { text: '🌙 THE NIGHT COURIER', font: 'bold 52px sans-serif', colour: '#ffd76a', gap: 60 },
    { text: 'A stealth game in a moonlit museum', font: '24px sans-serif', gap: 46 },
    { text: 'Carry the sealed letters to the golden door — unseen.', font: '19px sans-serif', gap: 40 },
    { text: 'WASD / arrows to walk  •  Shift to sneak  •  Click to walk there', font: '18px sans-serif', gap: 32 },
    { text: 'Right-click to throw a pebble and lure a guard  •  R to restart  •  P to pause', font: '18px sans-serif', gap: 56 },
    { text: '▶  Press ENTER or click to begin  ◀', font: 'bold 22px sans-serif', colour: '#9fe8b4' },
  ]);
}

export function drawPause(ctx) {
  dimScreen(ctx);
  centredText(ctx, [
    { text: 'PAUSED', font: 'bold 48px sans-serif', colour: '#ffd76a', gap: 56 },
    { text: 'Press P or click to keep sneaking', font: '20px sans-serif' },
  ]);
}

export function drawWin(ctx, game) {
  drawWorld(ctx, game);
  dimScreen(ctx);
  centredText(ctx, [
    { text: '🏆 THE LETTERS ARE DELIVERED', font: 'bold 42px sans-serif', colour: '#ffd76a', gap: 58 },
    { text: `All three wings crossed in ${game.totalTime.toFixed(1)}s — letters ${game.totalLetters}/12`, font: '22px sans-serif', gap: 44 },
    { text: game.totalLetters === 12 ? 'A perfect run: every letter found, never seen.' : 'The museum never knew you were there.', font: '19px sans-serif', gap: 56 },
    { text: 'Press R to play again', font: 'bold 21px sans-serif', colour: '#9fe8b4' },
  ]);
}

export function drawCaught(ctx, game) {
  drawWorld(ctx, game);
  dimScreen(ctx);
  centredText(ctx, [
    { text: '🚨 CAUGHT!', font: 'bold 52px sans-serif', colour: '#ff4d4d', gap: 58 },
    { text: `A guard caught you in ${game.level.name}.`, font: '22px sans-serif', gap: 44 },
    { text: 'Wait for the cones to pass, hide in the bushes,', font: '19px sans-serif', gap: 32 },
    { text: 'or throw a pebble to pull a guard away.', font: '19px sans-serif', gap: 56 },
    { text: 'Press R to try this wing again', font: 'bold 21px sans-serif', colour: '#9fe8b4' },
  ]);
}

/** Draw the current screen; `game.screen` picks the overlay. */
export function render(ctx, game) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  if (game.screen === SCREEN_TITLE) {
    drawTitle(ctx, game);
    return;
  }
  drawWorld(ctx, game);
  drawHud(ctx, game);
  if (game.screen === SCREEN_PAUSE) drawPause(ctx);
  if (game.screen === SCREEN_WIN) drawWin(ctx, game);
  if (game.screen === SCREEN_CAUGHT) drawCaught(ctx, game);
}
