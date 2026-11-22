// Patrol routes: the dotted paths a guard walks, and the sweep arc a
// lookout watches. Drawn faintly on the floor so a player can learn a
// patrol by looking, then time a crossing between the cones.
import { GUARD } from './config.js';

/** The dotted route a patroller walks, waypoint to waypoint. */
export function drawPatrolRoute(ctx, guard) {
  if (guard.kind === 'lookout') {
    drawSweepArc(ctx, guard);
    return;
  }
  const points = guard.waypoints;
  if (!points || points.length < 2) return;
  ctx.strokeStyle = 'rgba(232, 236, 244, 0.28)';
  ctx.lineWidth = 2;
  ctx.setLineDash([2, 10]);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(232, 236, 244, 0.4)';
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The arc a lookout sweeps its cone across, so its beat is readable. */
export function drawSweepArc(ctx, guard) {
  const range = GUARD.viewRange * 0.85;
  ctx.strokeStyle = 'rgba(245, 197, 66, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.arc(
    guard.post.x,
    guard.post.y,
    range,
    guard.sweepCenter - guard.sweepRange,
    guard.sweepCenter + guard.sweepRange,
  );
  ctx.stroke();
  ctx.setLineDash([]);
  // Tick marks at the ends of the sweep, where the cone turns around.
  ctx.fillStyle = 'rgba(245, 197, 66, 0.55)';
  for (const edge of [-1, 1]) {
    const angle = guard.sweepCenter + edge * guard.sweepRange;
    ctx.beginPath();
    ctx.arc(
      guard.post.x + Math.cos(angle) * range,
      guard.post.y + Math.sin(angle) * range,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}
