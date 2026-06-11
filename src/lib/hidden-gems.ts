// Hidden Gems — deterministic scoring for idle/distressed power-intensive
// industrial facilities ("the 45 MW sodium chlorite pattern").
//
// Design contract (replaces the Math.random() scores in the legacy
// idle-industry scanners):
//   * Every number is either measured (haversine to a curated asset),
//     published (registry row with source_url), or derived from the
//     documented intensity model below. Nothing is invented.
//   * Missing inputs lower `confidence` and contribute 0 to the score —
//     they never get a made-up default.
//   * Each score factor carries a `detail` string naming its evidence so
//     the UI can show provenance per line.

import { haversineKm } from '@/lib/osm-math';

// ────────────────────────────────────────────────────────────────────────────
// Energy-intensity model
// ────────────────────────────────────────────────────────────────────────────
// Electricity intensity by process, MWh per tonne of product (electrical
// only — excludes gas/steam). Sources: CIEEDAC industrial benchmarking,
// IEA pulp & paper / cement roadmaps, Euro Chlor & chlorate-industry
// references. These are mid-range planning figures, not plant audits;
// estimate_basis = 'intensity_model' rows must be presented as estimates.
export const ENERGY_INTENSITY_MWH_PER_TONNE: Record<string, number> = {
  sodium_chlorate: 9.0,    // electrolysis, ~8.5–9.5 MWh/t NaClO3
  chlor_alkali: 2.8,       // membrane cell, MWh/t Cl2
  pulp_mechanical: 2.2,    // BCTMP/TMP refiners
  newsprint: 2.2,          // TMP-based newsprint
  pulp_kraft: 0.62,        // net of black-liquor self-generation
  osb_panel: 0.18,         // per m³ (treated as tonne-equivalent for ranking)
  sawmill: 0.10,           // per m³ lumber
  cement: 0.11,            // grinding + kiln drives
  lime: 0.09,
  fertilizer_nitrogen: 0.24, // compression/ASU share (process heat is gas)
  methanol: 0.17,
  carbon_black: 0.45,
  metals_refinery: 2.0,    // electrowinning-dependent; wide range
  air_separation: 0.45,    // per tonne O2-equivalent
  hydrogen_electrolysis: 55, // per tonne H2
  canola_crush: 0.06,      // per tonne seed (t/day inputs are annualized)
  food_processing: 0.25,   // refrigeration-heavy lines
};

const HOURS_PER_YEAR = 8760;
const ASSUMED_UTILIZATION = 0.9;

/**
 * Derive an average electrical-load estimate (MW) from nameplate production
 * capacity. Returns null when the inputs don't support an estimate — callers
 * must surface "no estimate" rather than substituting a default.
 */
export function estimateFacilityMw(
  facilityType: string,
  capacityValue: number | null,
  capacityUnit: string | null,
): number | null {
  if (capacityValue == null || capacityValue <= 0) return null;
  // Published load figure — pass through regardless of facility type.
  if (capacityUnit === 'MW') return capacityValue;

  const intensity = ENERGY_INTENSITY_MWH_PER_TONNE[facilityType];
  if (intensity == null) return null;

  let annualTonnes: number;
  switch (capacityUnit) {
    case 't/yr':
      annualTonnes = capacityValue;
      break;
    case 't/day':
      annualTonnes = capacityValue * 365 * ASSUMED_UTILIZATION;
      break;
    case 'm3/yr':
      // Panel/lumber intensities above are quoted per m³, so pass through.
      annualTonnes = capacityValue;
      break;
    default:
      return null;
  }

  const mw = (annualTonnes * intensity) / HOURS_PER_YEAR / ASSUMED_UTILIZATION;
  return Math.round(mw * 10) / 10;
}

// ────────────────────────────────────────────────────────────────────────────
// Geometry
// ────────────────────────────────────────────────────────────────────────────

/**
 * Distance (km) from a point to a great-circle segment, approximated by
 * sampling the segment. Curated transmission/fiber/pipeline rows store only
 * straight start→end segments, so 16 samples bounds the error well under a
 * kilometre at Alberta scales — adequate for ranking, not for engineering.
 */
export function distanceToSegmentKm(
  lat: number, lng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number,
  samples = 16,
): number {
  let min = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const sLat = aLat + (bLat - aLat) * t;
    const sLng = aLng + (bLng - aLng) * t;
    const d = haversineKm(lat, lng, sLat, sLng);
    if (d < min) min = d;
  }
  return min;
}

// ────────────────────────────────────────────────────────────────────────────
// Inputs
// ────────────────────────────────────────────────────────────────────────────

export interface FacilityRow {
  id: string;
  name: string;
  operator: string | null;
  facility_type: string;
  naics_code: string | null;
  lat: number;
  lng: number;
  coordinates_precision: string;
  municipality: string | null;
  status: string;
  status_as_of: string | null;
  status_source_url: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  estimated_mw: number | null;
  estimate_basis: string | null;
  grid_voltage_kv: number | null;
  confidence: string;
  source_url: string | null;
  source_publisher: string | null;
  notes: string | null;
  last_verified: string | null;
}

export interface SubstationRow {
  name: string;
  latitude: number | null;
  longitude: number | null;
  voltage_level: string | null;
  capacity_mva: number | null;
  utility_owner: string | null;
}

export interface SegmentRow {
  name?: string | null;
  voltage_kv?: number | null;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

export interface PointRow {
  name?: string | null;
  lat: number;
  lng: number;
}

export interface GemContext {
  substations: SubstationRow[];
  transmissionLines: SegmentRow[];
  gasPipelines: SegmentRow[];
  fiberRoutes: SegmentRow[];
  waterSources: PointRow[];
}

// ────────────────────────────────────────────────────────────────────────────
// Scoring
// ────────────────────────────────────────────────────────────────────────────

// Acquisition-signal weight by operating status (0–35). A closed plant with
// intact interconnection is the strongest signal; a healthy operating plant
// is tracked but scores near zero on this axis.
export const STATUS_WEIGHTS: Record<string, number> = {
  closed: 35,
  announced_closure: 32,
  for_sale: 30,
  idle: 28,
  curtailed: 20,
  unknown: 10,
  operating: 4,
};

export interface ScoreFactor {
  key: string;
  score: number;
  max: number;
  detail: string;
}

export interface ScoredGem {
  facility: FacilityRow;
  total: number;            // 0–100
  grade: 'A' | 'B' | 'C' | 'D';
  confidence: 'high' | 'medium' | 'low';
  factors: ScoreFactor[];
  derivedMw: number | null; // estimated_mw or intensity-model fallback
  nearestSubstationKm: number | null;
  nearestSubstation: SubstationRow | null;
  nearestTransmissionKm: number | null;
  nearestTransmissionKv: number | null;
}

function logScale(value: number, atMax: number): number {
  // 0 at value<=1, 1 at value>=atMax, log-interpolated between.
  if (value <= 1) return 0;
  return Math.min(1, Math.log10(value) / Math.log10(atMax));
}

function proximityScore(km: number | null, fullAtKm: number, zeroAtKm: number): number {
  // 1 when within fullAtKm, 0 beyond zeroAtKm, linear between.
  if (km == null) return 0;
  if (km <= fullAtKm) return 1;
  if (km >= zeroAtKm) return 0;
  return 1 - (km - fullAtKm) / (zeroAtKm - fullAtKm);
}

export function scoreFacility(facility: FacilityRow, ctx: GemContext): ScoredGem {
  const factors: ScoreFactor[] = [];

  // ── Load magnitude (0–20): how big is the existing electrical load?
  const derivedMw =
    facility.estimated_mw ??
    estimateFacilityMw(facility.facility_type, facility.capacity_value, facility.capacity_unit);
  const loadScore = derivedMw == null ? 0 : Math.round(20 * logScale(derivedMw, 100));
  factors.push({
    key: 'load_magnitude', score: loadScore, max: 20,
    detail: derivedMw == null
      ? 'No load estimate available (missing capacity data) — scored 0, not defaulted'
      : `≈${derivedMw} MW ${facility.estimate_basis === 'published' ? 'published' : 'via intensity model'} (${facility.facility_type})`,
  });

  // ── Grid proximity (0–20): nearest seeded substation.
  let nearestSub: SubstationRow | null = null;
  let nearestSubKm: number | null = null;
  for (const s of ctx.substations) {
    if (s.latitude == null || s.longitude == null) continue;
    const d = haversineKm(facility.lat, facility.lng, s.latitude, s.longitude);
    if (nearestSubKm == null || d < nearestSubKm) { nearestSubKm = d; nearestSub = s; }
  }
  const subScore = Math.round(20 * proximityScore(nearestSubKm, 2, 40));
  factors.push({
    key: 'substation_proximity', score: subScore, max: 20,
    detail: nearestSub
      ? `${nearestSub.name} (${nearestSub.voltage_level ?? '?'}, ${nearestSub.capacity_mva ?? '?'} MVA) at ${nearestSubKm!.toFixed(1)} km`
      : 'No substation in curated dataset within range',
  });

  // ── Transmission proximity (0–10): nearest curated line segment + voltage.
  let nearestLineKm: number | null = null;
  let nearestLineKv: number | null = null;
  for (const l of ctx.transmissionLines) {
    const d = distanceToSegmentKm(facility.lat, facility.lng, l.start_lat, l.start_lng, l.end_lat, l.end_lng);
    if (nearestLineKm == null || d < nearestLineKm) { nearestLineKm = d; nearestLineKv = l.voltage_kv ?? null; }
  }
  const kvBonus = nearestLineKv != null && nearestLineKv >= 240 ? 1 : nearestLineKv != null && nearestLineKv >= 138 ? 0.8 : 0.6;
  const lineScore = Math.round(10 * proximityScore(nearestLineKm, 1, 25) * kvBonus);
  factors.push({
    key: 'transmission_proximity', score: lineScore, max: 10,
    detail: nearestLineKm != null
      ? `${nearestLineKv ?? '?'} kV line at ${nearestLineKm.toFixed(1)} km`
      : 'No curated transmission segment within range',
  });

  // ── Acquisition signal (0–35): operating status drives the gem thesis.
  const statusWeight = STATUS_WEIGHTS[facility.status] ?? STATUS_WEIGHTS.unknown;
  factors.push({
    key: 'acquisition_signal', score: statusWeight, max: 35,
    detail: `Status "${facility.status}"${facility.status_as_of ? ` as of ${facility.status_as_of}` : ''}${facility.status_source_url ? ' (sourced)' : ' (unsourced — verify)'}`,
  });

  // ── Site fundamentals (0–15): gas, water, fiber proximity from curated layers.
  let gasKm: number | null = null;
  for (const g of ctx.gasPipelines) {
    const d = distanceToSegmentKm(facility.lat, facility.lng, g.start_lat, g.start_lng, g.end_lat, g.end_lng);
    if (gasKm == null || d < gasKm) gasKm = d;
  }
  let waterKm: number | null = null;
  for (const w of ctx.waterSources) {
    const d = haversineKm(facility.lat, facility.lng, w.lat, w.lng);
    if (waterKm == null || d < waterKm) waterKm = d;
  }
  let fiberKm: number | null = null;
  for (const f of ctx.fiberRoutes) {
    const d = distanceToSegmentKm(facility.lat, facility.lng, f.start_lat, f.start_lng, f.end_lat, f.end_lng);
    if (fiberKm == null || d < fiberKm) fiberKm = d;
  }
  const fundamentals = Math.round(
    5 * proximityScore(gasKm, 5, 50) +
    5 * proximityScore(waterKm, 5, 50) +
    5 * proximityScore(fiberKm, 5, 60),
  );
  factors.push({
    key: 'site_fundamentals', score: fundamentals, max: 15,
    detail: `Gas ${gasKm != null ? gasKm.toFixed(0) + ' km' : '—'} · Water ${waterKm != null ? waterKm.toFixed(0) + ' km' : '—'} · Fiber ${fiberKm != null ? fiberKm.toFixed(0) + ' km' : '—'}`,
  });

  const total = factors.reduce((s, f) => s + f.score, 0);
  const grade: ScoredGem['grade'] = total >= 70 ? 'A' : total >= 55 ? 'B' : total >= 40 ? 'C' : 'D';

  // Confidence: floor of registry confidence and data completeness.
  const registryConf = (['high', 'medium', 'low'].includes(facility.confidence)
    ? facility.confidence : 'low') as 'high' | 'medium' | 'low';
  const dataGaps = (derivedMw == null ? 1 : 0) + (nearestSubKm == null ? 1 : 0) + (facility.status === 'unknown' ? 1 : 0);
  const confidence: ScoredGem['confidence'] =
    dataGaps >= 2 ? 'low' : dataGaps === 1 && registryConf === 'high' ? 'medium' : registryConf;

  return {
    facility, total, grade, confidence, factors,
    derivedMw,
    nearestSubstationKm: nearestSubKm, nearestSubstation: nearestSub,
    nearestTransmissionKm: nearestLineKm, nearestTransmissionKv: nearestLineKv,
  };
}

export interface GemFilters {
  minMw?: number;
  statuses?: string[];
  facilityTypes?: string[];
}

export function rankHiddenGems(
  facilities: FacilityRow[],
  ctx: GemContext,
  filters: GemFilters = {},
): ScoredGem[] {
  return facilities
    .map((f) => scoreFacility(f, ctx))
    .filter((g) => {
      if (filters.minMw != null && (g.derivedMw == null || g.derivedMw < filters.minMw)) return false;
      if (filters.statuses?.length && !filters.statuses.includes(g.facility.status)) return false;
      if (filters.facilityTypes?.length && !filters.facilityTypes.includes(g.facility.facility_type)) return false;
      return true;
    })
    .sort((a, b) => b.total - a.total);
}
