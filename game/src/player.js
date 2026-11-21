// The courier: movement, click-to-move, pebble throws, collecting letters,
// and the win / caught checks. Movement is a circle pushed out of walls.
import { FIELD, PLAYER } from './config.js';
import { pointInRect, pointInRects } from './level.js';
import { distractGuards } from './guards.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    radius: PLAYER.radius,
    /** Where a mouse click told the courier to walk, or null. */
    moveTarget: null,
    /** True while the courier creeps (Shift held): slower, harder to spot. */
    sneaking: false,
    facing: -Math.PI / 2,
    pebbles: PLAYER.pebbles,
    letters: 0,
    steps: 0,
    stepDistance: 0,
    hidden: false,
  };
}

/** Push a circle out of every wall rect it overlaps. */
export function resolveWalls(entity, walls) {
  for (const wall of walls) {
    const nearestX = Math.max(wall.x, Math.min(entity.x, wall.x + wall.w));
    const nearestY = Math.max(wall.y, Math.min(entity.y, wall.y + wall.h));
    const dx = entity.x - nearestX;
    const dy = entity.y - nearestY;
    const distance = Math.hypot(dx, dy);
    if (distance < entity.radius) {
      if (distance === 0) {
        entity.y = wall.y - entity.radius;
      } else {
        entity.x = nearestX + (dx / distance) * entity.radius;
        entity.y = nearestY + (dy / distance) * entity.radius;
      }
    }
  }
  entity.x = Math.max(entity.radius, Math.min(FIELD.width - entity.radius, entity.x));
  entity.y = Math.max(entity.radius, Math.min(FIELD.height - entity.radius, entity.y));
}

/**
 * One fixed step of the player. `keys` is the held-key set from input.js.
 * Returns 'footstep' every 26 px walked (for the audio), or null.
 */
export function updatePlayer(player, keys, level, guards, dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  player.sneaking = keys.has('shift');

  if (dx !== 0 || dy !== 0) {
    // Keyboard steering cancels a click target.
    player.moveTarget = null;
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
  } else if (player.moveTarget) {
    const tx = player.moveTarget.x - player.x;
    const ty = player.moveTarget.y - player.y;
    const distance = Math.hypot(tx, ty);
    if (distance < 6) {
      player.moveTarget = null;
    } else {
      dx = tx / distance;
      dy = ty / distance;
    }
  }

  const speed = player.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
  if (dx !== 0 || dy !== 0) {
    player.x += dx * speed * dt;
    player.y += dy * speed * dt;
    player.facing = Math.atan2(dy, dx);
    player.stepDistance += speed * dt;
  }
  resolveWalls(player, level.walls);

  player.hidden = pointInRects(player.x, player.y, level.bushes);

  // Letters are collected by walking over them.
  for (const letter of level.letters) {
    if (!letter.taken && Math.hypot(letter.x - player.x, letter.y - player.y) < 26) {
      letter.taken = true;
      player.letters += 1;
    }
  }

  if (player.stepDistance >= 26) {
    player.stepDistance = 0;
    player.steps += 1;
    return 'footstep';
  }
  return null;
}

/** Throw a pebble at (x, y): guards nearby go to investigate the noise. */
export function throwPebble(player, guards, x, y) {
  if (player.pebbles <= 0) return false;
  player.pebbles -= 1;
  // A click on the letterbox margin maps outside the field; clamp it so a
  // guard never walks to a spot behind the border wall and stalls there.
  const targetX = Math.max(0, Math.min(FIELD.width, x));
  const targetY = Math.max(0, Math.min(FIELD.height, y));
  distractGuards(guards, targetX, targetY);
  return true;
}

/** True when the courier stands in the exit doorway. */
export function reachedExit(player, level) {
  return pointInRect(player.x, player.y, level.exit);
}

/** True when any chasing guard has caught the courier. */
export function caughtByGuard(player, guards) {
  for (const guard of guards) {
    if (guard.state === 'chase' && Math.hypot(guard.x - player.x, guard.y - player.y) < 26) {
      return true;
    }
  }
  return false;
}
