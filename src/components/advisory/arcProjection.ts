// Pure projection + arc helpers used by AdvisoryPipelineMap. Extracted so the
// math has unit-test coverage independent of the React rendering layer.

export const ARC_VIEWBOX_WIDTH = 1000;
export const ARC_VIEWBOX_HEIGHT = 500;

export interface Point2D {
  x: number;
  y: number;
}

export interface ArcPath {
  hq: Point2D;
  site: Point2D;
  control: Point2D;
  d: string;
}

/**
 * Equirectangular projection of (lng, lat) into the SVG viewbox. Caller
 * supplies lng in [-180, 180] and lat in [-90, 90]; the result is clamped
 * to the viewbox without wrapping.
 */
export function projectLngLat(lng: number, lat: number): Point2D {
  return {
    x: ((lng + 180) / 360) * ARC_VIEWBOX_WIDTH,
    y: ((90 - lat) / 180) * ARC_VIEWBOX_HEIGHT,
  };
}

/**
 * Build a quadratic-Bézier arc from `hq` to `site`, lifted perpendicular to
 * the chord so concentric arcs don't overlap. Returns the control point and
 * an SVG path string ready to drop into a <path d=...> attribute. Same-point
 * input (length 0) produces a degenerate but non-NaN path that renders as a
 * point.
 */
export function computeArc(hq: Point2D, site: Point2D): ArcPath {
  const mx = (hq.x + site.x) / 2;
  const my = (hq.y + site.y) / 2;
  const dx = site.x - hq.x;
  const dy = site.y - hq.y;
  // Guard against same-point input: keep length non-zero so nx/ny stay finite.
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(160, len * 0.28);
  const nx = -dy / len;
  const ny = dx / len;
  // Always lift toward the top of the map so the arc reads as an arch.
  const sign = ny < 0 ? 1 : -1;
  const cx = mx + nx * lift * sign;
  const cy = my + ny * lift * sign;
  return {
    hq,
    site,
    control: { x: cx, y: cy },
    d: `M${hq.x} ${hq.y} Q${cx} ${cy} ${site.x} ${site.y}`,
  };
}
