// Guards: patrol routes, vision cones, line of sight, and the suspicion
// meter that gives the player a chance to recover before a chase begins.
import { GUARD } from './config.js';
import { pointInRects } from './level.js';

/** A live guard from a level's guard definition. */
export function createGuard(def) {
  const first = def.waypoints[0];
  const second = def.waypoints[1] ?? first;
  const kind = def.kind ?? 'patroller';
  return {
    x: first.x,
    y: first.y,
    angle: Math.atan2(second.y - first.y, second.x - first.x),
    waypoints: def.waypoints,
    waypointIndex: 1 % def.waypoints.length,
    speed: def.speed,
    pauseSeconds: def.pauseSeconds ?? 1,
    pauseLeft: 0,
    /** patroller walks a route; lookout stands at a post and sweeps its cone. */
    kind,
    /** The post a lookout returns to, and the sweep it makes while on it. */
    post: { x: first.x, y: first.y },
    sweepCenter: def.sweepCenter ?? Math.atan2(second.y - first.y, second.x - first.x),
    sweepRange: def.sweepRange ?? 1.1,
    sweepSeconds: def.sweepSeconds ?? 5,
    sweepPhase: 0,
    /** Fading footstep dots, newest last: {x, y} pairs left while walking. */
    trail: [],
    trailTimer: 0,
    /** calm | suspicious | alerted | chase */
    state: 'calm',
    suspicion: 0,
    lastSeen: null,
    investigate: null,
    lookTimer: 0,
    scanAngle: 0,
  };
}

/** Leave a footstep dot behind a guard that is walking, fading the old ones. */
export function recordFootstep(guard, dt) {
  guard.trailTimer += dt;
  if (guard.trailTimer < 0.12) return;
  guard.trailTimer = 0;
  const last = guard.trail[guard.trail.length - 1];
  if (last && Math.hypot(guard.x - last.x, guard.y - last.y) < 8) return;
  guard.trail.push({ x: guard.x, y: guard.y });
  while (guard.trail.length > 14) guard.trail.shift();
}

/** Move a point toward a target by at most `distance`; returns true on arrival. */
export function moveToward(entity, target, distance) {
  const dx = target.x - entity.x;
  const dy = target.y - entity.y;
  const length = Math.hypot(dx, dy);
  if (length <= distance) {
    entity.x = target.x;
    entity.y = target.y;
    return true;
  }
  entity.x += (dx / length) * distance;
  entity.y += (dy / length) * distance;
  entity.angle = Math.atan2(dy, dx);
  return false;
}

/** True when the segment (x1,y1)-(x2,y2) touches the rect. */
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < rect.x || minX > rect.x + rect.w || maxY < rect.y || minY > rect.y + rect.h) return false;
  // An endpoint inside the rect means the segment is blocked.
  if (
    (x1 >= rect.x && x1 <= rect.x + rect.w && y1 >= rect.y && y1 <= rect.y + rect.h) ||
    (x2 >= rect.x && x2 <= rect.x + rect.w && y2 >= rect.y && y2 <= rect.y + rect.h)
  ) {
    return true;
  }
  return (
    segmentsCross(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.w, rect.y) ||
    segmentsCross(x1, y1, x2, y2, rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h) ||
    segmentsCross(x1, y1, x2, y2, rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h) ||
    segmentsCross(x1, y1, x2, y2, rect.x, rect.y + rect.h, rect.x, rect.y)
  );
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** True when no wall stands between the guard and the point. */
export function hasLineOfSight(guard, x, y, walls) {
  for (const wall of walls) {
    if (segmentHitsRect(guard.x, guard.y, x, y, wall)) return false;
  }
  return true;
}

/** Smallest absolute angle between two headings, in radians. */
export function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff);
}

/**
 * Can this guard see the player right now? The player must be inside the
 * vision cone, in line of sight, and not hidden: crouched in a bush (unless
 * the guard is almost on top of them) or deep in a shadow zone, which only
 * slows the spot rate — the caller applies the shadow factor.
 */
export function canSeePlayer(guard, player, level) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > GUARD.viewRange) return { sees: false, distance };
  if (angleDifference(Math.atan2(dy, dx), guard.angle) > GUARD.viewHalfAngle) {
    return { sees: false, distance };
  }
  if (!hasLineOfSight(guard, player.x, player.y, level.walls)) return { sees: false, distance };
  const inBush = pointInRects(player.x, player.y, level.bushes);
  if (inBush && distance > GUARD.bushRevealRange) return { sees: false, distance };
  const inShadow = pointInRects(player.x, player.y, level.shadows);
  return { sees: true, distance, inShadow };
}

/**
 * One fixed step of a guard. Returns 'spotted' the moment suspicion crosses
 * the chase line, 'nearMiss' when the player slips out of sight while the
 * guard was close to chasing, and null otherwise.
 */
export function updateGuard(guard, player, level, dt) {
  const sight = canSeePlayer(guard, player, level);
  const wasClose = guard.suspicion >= 60;
  if (sight.sees) {
    // Closer and better-lit sightings raise suspicion faster.
    const closeness = 1 - sight.distance / GUARD.viewRange;
    let rate = GUARD.suspicionRate * (0.45 + 0.85 * closeness);
    if (sight.inShadow) rate *= GUARD.shadowSlowdown;
    if (player.sneaking) rate *= 0.6;
    guard.suspicion = Math.min(GUARD.chaseAt, guard.suspicion + rate * dt);
    guard.lastSeen = { x: player.x, y: player.y };
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - GUARD.suspicionDecay * dt);
  }

  const previousState = guard.state;
  if (guard.suspicion >= GUARD.chaseAt) guard.state = 'chase';
  else if (guard.suspicion >= GUARD.suspiciousAt) guard.state = 'suspicious';
  else guard.state = 'calm';
  // A guard that just lost the player keeps investigating the last seen spot.
  if (previousState === 'chase' && guard.state !== 'chase' && guard.lastSeen) {
    guard.state = 'suspicious';
    guard.investigate = { ...guard.lastSeen };
  }

  if (guard.state === 'chase' && guard.lastSeen) {
    moveToward(guard, guard.lastSeen, GUARD.chaseSpeed * dt);
    if (guard.suspicion >= GUARD.chaseAt) return 'spotted';
  } else if (guard.state === 'suspicious') {
    const target = guard.investigate ?? guard.lastSeen;
    if (target) {
      const arrived = moveToward(guard, target, GUARD.suspiciousSpeed * dt);
      if (arrived) {
        // Look around for a moment, then give up and go back to patrol.
        guard.lookTimer += dt;
        guard.angle += Math.sin(guard.lookTimer * 2.4) * 1.6 * dt;
        if (guard.lookTimer > 2.2) {
          guard.lookTimer = 0;
          guard.investigate = null;
          guard.lastSeen = null;
          guard.state = 'calm';
        }
      }
    }
  } else {
    // Patrol: walk the waypoints, pausing at each one to look around.
    // A lookout instead holds its post: it walks back when it has strayed,
    // then sweeps its cone back and forth across its beat.
    if (guard.kind === 'lookout') {
      const home = Math.hypot(guard.post.x - guard.x, guard.post.y - guard.y);
      if (home > 12) {
        moveToward(guard, guard.post, guard.speed * dt);
        recordFootstep(guard, dt);
      } else {
        guard.sweepPhase += dt;
        guard.angle =
          guard.sweepCenter +
          Math.sin((guard.sweepPhase / guard.sweepSeconds) * Math.PI * 2) * guard.sweepRange;
      }
    } else if (guard.pauseLeft > 0) {
      guard.pauseLeft -= dt;
      guard.angle += Math.sin(guard.pauseLeft * 3) * 0.5 * dt;
    } else {
      const target = guard.waypoints[guard.waypointIndex];
      const arrived = moveToward(guard, target, guard.speed * dt);
      recordFootstep(guard, dt);
      if (arrived) {
        guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
        guard.pauseLeft = guard.pauseSeconds;
      }
    }
  }

  if (wasClose && !sight.sees && guard.suspicion < 60 && guard.suspicion > 25) {
    return 'nearMiss';
  }
  return null;
}

/** The cone colour for a guard's current alert state. */
export function coneColour(state) {
  if (state === 'chase') return 'rgba(255, 77, 77, 0.46)';
  if (state === 'alerted') return 'rgba(255, 140, 66, 0.40)';
  if (state === 'suspicious') return 'rgba(245, 197, 66, 0.36)';
  return 'rgba(88, 214, 141, 0.30)';
}

/** Send every guard to investigate a noise at (x, y). */
export function distractGuards(guards, x, y) {
  for (const guard of guards) {
    const distance = Math.hypot(guard.x - x, guard.y - y);
    if (distance < GUARD.pebbleNoiseRadius && guard.state !== 'chase') {
      guard.investigate = { x, y };
      guard.suspicion = Math.max(guard.suspicion, GUARD.suspiciousAt);
      guard.state = 'suspicious';
    }
  }
}
