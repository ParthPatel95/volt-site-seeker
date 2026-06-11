// Projection + visual-encoding helpers for the Hidden Gems 3D view.
//
// Encoding contract (the "nothing made up" rule, visually):
//   * Bar HEIGHT encodes the MW estimate. Facilities with no estimate render
//     as flat discs (height 0) — we never invent a height.
//   * Bar COLOR encodes operating status (acquisition signal), not vibes.
//   * Everything in the scene maps 1:1 to a registry/curated-table row; the
//     click-through card shows the same provenance fields as the list view.

export interface RegionSpec {
  key: 'AB' | 'TX';
  label: string;
  centerLat: number;
  centerLng: number;
  /** Half-extent of the modelled area in km (scene clamps beyond this). */
  spanKm: number;
}

export const REGIONS: Record<'AB' | 'TX', RegionSpec> = {
  AB: { key: 'AB', label: 'Alberta', centerLat: 53.2, centerLng: -113.8, spanKm: 700 },
  TX: { key: 'TX', label: 'Texas', centerLat: 30.6, centerLng: -96.6, spanKm: 700 },
};

const KM_PER_DEG_LAT = 111.32;

/**
 * Project lat/lng onto the scene's X/Z plane (km-true equirectangular around
 * the region centre; scene units = km / 10 so a 700 km region spans 70u).
 * Returns null when the point falls outside the region's modelled span —
 * callers should skip it rather than clamp it to a wrong position.
 */
export function projectToScene(
  lat: number,
  lng: number,
  region: RegionSpec,
): { x: number; z: number } | null {
  const kmNorth = (lat - region.centerLat) * KM_PER_DEG_LAT;
  const kmEast =
    (lng - region.centerLng) *
    KM_PER_DEG_LAT *
    Math.cos((region.centerLat * Math.PI) / 180);
  if (Math.abs(kmNorth) > region.spanKm || Math.abs(kmEast) > region.spanKm) return null;
  // three.js: +X east, +Z south (so north renders "up" when looking down).
  return { x: kmEast / 10, z: -kmNorth / 10 };
}

/** Bar height in scene units. 0 (flat disc) when MW is unknown — by design. */
export function mwToBarHeight(mw: number | null): number {
  if (mw == null || mw <= 0) return 0;
  // sqrt scale keeps a 450 MW smelter (~8.5u) and a 10 MW mill (~1.3u) both legible.
  return Math.sqrt(mw) * 0.4;
}

/** Status → hex color. Hot colors = strong acquisition signal. */
export function statusColor(status: string): string {
  switch (status) {
    case 'closed': return '#ef4444';            // red — strongest signal
    case 'announced_closure': return '#f97316'; // orange
    case 'for_sale': return '#f59e0b';          // amber
    case 'idle': return '#eab308';              // yellow
    case 'curtailed': return '#a3e635';         // lime
    case 'operating': return '#10b981';         // green — tracked, low signal
    default: return '#94a3b8';                  // slate — unknown
  }
}
