// Pure math helpers shared by the OSM power-infrastructure feature.
//
// These mirror the Deno-only versions in
// `supabase/functions/osm-power-infrastructure/index.ts`. Keep both copies in
// sync if you change behaviour — the edge function cannot import from `src/`
// at runtime, but `src/lib/osm-math.test.ts` exercises this TS copy as the
// reference implementation.

export type VoltageClass = '≥240 kV' | '138–230 kV' | '69–138 kV' | '<69 kV';

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in km between two lat/lng points (Haversine). */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Initial bearing in degrees (0 = north, 90 = east). Returns 0..360. */
export function bearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lng1);
  const λ2 = toRad(lng2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Assign a voltage in kV to one of the four reporting buckets. */
export function classifyVoltage(kv: number): VoltageClass {
  if (kv >= 240) return '≥240 kV';
  if (kv >= 138) return '138–230 kV';
  if (kv >= 69) return '69–138 kV';
  return '<69 kV';
}

/**
 * Parse an OSM `voltage` tag (semicolon-separated volts, sometimes labelled
 * with units) into a sorted-descending list of kV values. Garbage entries
 * are dropped. Returns [] for empty / unparseable inputs.
 */
export function parseVoltageKv(raw: string | null | undefined): number[] {
  if (!raw) return [];
  const parts = String(raw)
    .split(/[;,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: number[] = [];
  for (const p of parts) {
    const m = p.match(/([\d.]+)\s*(kV|V)?/i);
    if (!m) continue;
    const v = parseFloat(m[1]);
    if (!isFinite(v)) continue;
    const unit = (m[2] ?? 'V').toUpperCase();
    out.push(unit === 'KV' ? v : v / 1000);
  }
  return out.sort((a, b) => b - a);
}

export interface InterconnectInput {
  distance_km: number;
  max_kv: number | null;
  substation_type: string | null;
  operator: string | null;
}

export interface InterconnectScored<T extends InterconnectInput> {
  candidate: T;
  score: number;
  rationale: string;
}

/**
 * Score a transmission substation as an interconnect candidate. Returns a
 * non-negative integer score and a brief rationale. Matches the formula in
 * the edge function: closer + higher voltage + tagged-as-transmission +
 * known operator → higher score.
 */
export function scoreInterconnectCandidate<T extends InterconnectInput>(
  s: T,
): InterconnectScored<T> {
  const kv = s.max_kv ?? 0;
  const distScore = Math.max(0, 40 - s.distance_km * 4);
  const kvScore = Math.min(35, kv / 7);
  const typeScore =
    s.substation_type === 'transmission' ? 15 : s.substation_type ? 8 : 5;
  const opScore = s.operator ? 10 : 0;
  const score = Math.round(distScore + kvScore + typeScore + opScore);
  const rationale: string[] = [];
  if (s.distance_km < 2) rationale.push('within 2 km');
  else if (s.distance_km < 5) rationale.push('within 5 km');
  if (kv >= 240) rationale.push(`bulk ${kv} kV tie-in`);
  else if (kv >= 138) rationale.push(`${kv} kV transmission`);
  if (s.substation_type === 'transmission') rationale.push('OSM tagged as transmission');
  if (s.operator) rationale.push(`operated by ${s.operator}`);
  return {
    candidate: s,
    score,
    rationale: rationale.join(' · ') || 'tagged power asset',
  };
}
