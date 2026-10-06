// src/sim/collision.js  (all units are SVG units in the 640x440 scene)
export const WALL_Y = 215;        // wall centre line
export const BAND = 22;           // person centre may not enter y in (WALL_Y-BAND, WALL_Y+BAND) unless it can cross
export const DOOR_CX = 320;       // doorway centre
export const PANEL_W = 80;        // each panel width
export const R = 14;              // person radius
export const MARGIN = 4;

// Scene bounds
export const SCENE_W = 640;
export const SCENE_H = 440;

// Half-width of the open gap between the panels at open fraction p (0 closed .. 1 open)
export const gapHalf = (p) => PANEL_W * Math.max(0, Math.min(1, p));

// A person at x can pass only if the whole body fits inside the gap
export const canCross = (x, p) => Math.abs(x - DOOR_CX) + R + MARGIN <= gapHalf(p);

// The smallest open fraction a person standing at x inside the band allows (door may not close past it)
export const minPForPerson = (x) => (Math.abs(x - DOOR_CX) + R + MARGIN) / PANEL_W;

// Returns the furthest allowed position when moving from `from` to `to` ({x,y}) at open fraction p.
export function resolveMove(from, to, p) {
  // 1. Clamp to scene bounds (R from edges)
  let targetX = Math.max(R, Math.min(SCENE_W - R, to.x));
  let targetY = Math.max(R, Math.min(SCENE_H - R, to.y));

  const lowerEdge = WALL_Y + BAND; // 237 (outside boundary)
  const upperEdge = WALL_Y - BAND; // 193 (inside boundary)

  const fromY = from.y;

  // Case A: Starting Outside (y >= 237)
  if (fromY >= lowerEdge) {
    if (targetY < lowerEdge) {
      if (!canCross(targetX, p)) {
        targetY = lowerEdge; // Blocked outside
      }
    }
  }
  // Case B: Starting Inside (y <= 193)
  else if (fromY <= upperEdge) {
    if (targetY > upperEdge) {
      if (!canCross(targetX, p)) {
        targetY = upperEdge; // Blocked inside
      }
    }
  }
  // Case C: Already inside the wall band (193 < fromY < 237)
  else {
    if (!canCross(targetX, p)) {
      // Cannot cross band: stay on the side from which it came, or clamp
      if (fromY > WALL_Y && targetY < lowerEdge) {
        targetY = lowerEdge;
      } else if (fromY < WALL_Y && targetY > upperEdge) {
        targetY = upperEdge;
      }
    }
  }

  return { x: targetX, y: targetY };
}
