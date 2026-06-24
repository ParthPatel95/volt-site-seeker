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
// references, USGS minerals yearbooks, EUROFER steel benchmarks, IEA Iron
// & Steel Roadmap, IFA ammonia benchmarks. These are mid-range planning
// figures, not plant audits; estimate_basis = 'intensity_model' rows must
// be presented as estimates.
export const ENERGY_INTENSITY_MWH_PER_TONNE: Record<string, number> = {
  // ── Pulp, paper & wood products ──────────────────────────────────────────
  pulp_mechanical: 2.2,    // BCTMP/TMP refiners
  newsprint: 2.2,          // TMP-based newsprint
  pulp_kraft: 0.62,        // net of black-liquor self-generation
  containerboard: 0.35,    // recycled/kraft linerboard
  osb_panel: 0.18,         // per m³ (treated as tonne-equivalent for ranking)
  sawmill: 0.10,           // per m³ lumber

  // ── Inorganic / industrial chemicals ─────────────────────────────────────
  sodium_chlorate: 9.0,    // electrolysis, ~8.5–9.5 MWh/t NaClO3
  chlor_alkali: 2.8,       // membrane cell, MWh/t Cl2
  hydrogen_electrolysis: 55, // per tonne H2
  ammonia: 0.6,            // electric share of Haber–Bosch (compression + ASU)
  methanol: 0.17,
  carbon_black: 0.45,
  soda_ash: 0.15,          // Solvay process electricity share
  pvc: 0.6,                // EDC/VCM + polymerisation
  polyethylene: 0.4,       // LDPE/HDPE blend
  polypropylene: 0.4,
  ethylene_cracker: 0.15,  // compressors only — process heat is gas
  fertilizer_nitrogen: 0.24, // compression/ASU share (process heat is gas)
  air_separation: 0.45,    // per tonne O2-equivalent

  // ── Metals (smelting & refining) ─────────────────────────────────────────
  aluminum_smelter: 14.5,  // Hall–Héroult electrolysis — highest of all
  silicon_metal: 12.0,     // submerged-arc furnace, metallurgical-grade Si
  polysilicon: 50.0,       // Siemens process, solar-grade
  ferrosilicon: 9.0,       // SAF, 75% Si grade
  ferromanganese: 3.0,     // SAF, high-carbon FeMn
  ferrochrome: 3.5,        // SAF, charge-chrome
  metals_refinery: 2.0,    // electrowinning-dependent; wide range
  copper_smelter: 2.5,     // flash smelt + electrorefining
  zinc_smelter: 3.8,       // primary electrolysis route
  lead_smelter: 0.7,       // ISP / Kaldo-type
  magnesium_smelter: 14.0, // Pidgeon route electricity share
  eaf_steel: 0.50,         // electric-arc furnace melt + casting
  foundry_ferrous: 0.8,    // induction melt + casting
  steel_rolling: 0.30,     // re-heat + rolling stand drives

  // ── Mining & mineral processing ──────────────────────────────────────────
  cement: 0.11,            // grinding + kiln drives
  lime: 0.09,
  glass_float: 1.0,        // electric boost share of float-glass tank
  glass_container: 0.7,    // IS-machine forming + electric boost
  potash_mine: 0.18,       // per tonne KCl product (compaction + flotation)
  silica_sand: 0.10,
  gold_mine_mill: 0.05,    // per tonne ore (mill + leach circuit)
  gypsum_board: 0.05,

  // ── Agri-processing & food ───────────────────────────────────────────────
  canola_crush: 0.06,      // per tonne seed (t/day inputs are annualized)
  food_processing: 0.25,   // refrigeration-heavy lines
  cold_storage: 0.04,      // per m³ — bulk refrigerated warehouse

  // ── Compute / hyper-scale loads (named for completeness) ─────────────────
  datacenter_legacy: 0.0,  // load is published as MW; no per-tonne intensity

  // Excluded: semiconductor_fab and lng_liquefaction are real heavy loads
  // but no defensible per-unit intensity exists — those rows only get an
  // MW figure when one is published. datacenter_legacy is listed so the
  // taxonomy covers them but always falls through to published MW only.
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
  state?: string; // 'AB' | 'TX'
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
  // Populated by the facility-refine edge function from live APIs; never seeded.
  location_method?: string | null;          // 'google_places' | 'google_geocode' | 'osm_parcel_snap' | 'seed'
  osm_substation_km?: number | null;        // measured via Overpass at the site
  osm_max_voltage_kv?: number | null;
  osm_checked_at?: string | null;
  // Extended coordinate provenance (facility-refine v2 — Places + parcel snap).
  coord_provider?: string | null;
  coord_consensus_km?: number | null;       // max distance between candidate providers
  coord_candidates?: Array<{ provider: string; lat: number; lng: number; label?: string | null; kind?: string | null }> | null;
  osm_parcel_id?: string | null;            // OSM way/relation we snapped to
  osm_parcel_name?: string | null;
  osm_parcel_kind?: string | null;
  // Closure-signal activity trend, written by facility-activity-monitor.
  activity_trend?: string | null;           // 'rising_vegetation' | 'recovering' | 'stable' | 'no_data'
  activity_trend_score?: number | null;     // 0–100; higher = stronger closure signal
  activity_window_start?: string | null;
  activity_window_end?: string | null;
  activity_checked_at?: string | null;
  activity_evidence?: string | null;
  // Optional deal-team contact + broker fields (Hidden Gems detail dialog).
  contact_name?: string | null;
  contact_role?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  broker_name?: string | null;
  broker_url?: string | null;
  deal_notes?: string | null;
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

  // ── Grid proximity (0–20). A live OSM measurement at the facility (written
  // by facility-refine) outranks the curated-table approximation: it is a
  // per-site Overpass result, not a distance to a seeded row.
  let nearestSub: SubstationRow | null = null;
  let nearestSubKm: number | null = null;
  let subDetail: string;
  if (facility.osm_substation_km != null) {
    nearestSubKm = facility.osm_substation_km;
    const checked = facility.osm_checked_at ? facility.osm_checked_at.slice(0, 10) : 'unknown date';
    subDetail = `OSM-verified: nearest substation ${nearestSubKm.toFixed(1)} km`
      + (facility.osm_max_voltage_kv != null ? `, up to ${facility.osm_max_voltage_kv} kV nearby` : '')
      + ` (checked ${checked})`;
  } else {
    for (const s of ctx.substations) {
      if (s.latitude == null || s.longitude == null) continue;
      const d = haversineKm(facility.lat, facility.lng, s.latitude, s.longitude);
      if (nearestSubKm == null || d < nearestSubKm) { nearestSubKm = d; nearestSub = s; }
    }
    subDetail = nearestSub
      ? `${nearestSub.name} (${nearestSub.voltage_level ?? '?'}, ${nearestSub.capacity_mva ?? '?'} MVA) at ${nearestSubKm!.toFixed(1)} km — curated dataset, run a refine for live OSM check`
      : 'No substation in curated dataset within range — run a refine for live OSM check';
  }
  const subScore = Math.round(20 * proximityScore(nearestSubKm, 2, 40));
  factors.push({
    key: 'substation_proximity', score: subScore, max: 20,
    detail: subDetail,
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

  // Confidence: floor of registry confidence and data completeness. A
  // facility that has been through facility-refine (geocoded + live OSM
  // check) earns one notch up — its location and grid context are
  // API-verified rather than desk research.
  const registryConf = (['high', 'medium', 'low'].includes(facility.confidence)
    ? facility.confidence : 'low') as 'high' | 'medium' | 'low';
  const dataGaps = (derivedMw == null ? 1 : 0) + (nearestSubKm == null ? 1 : 0) + (facility.status === 'unknown' ? 1 : 0);
  const apiVerified = facility.location_method === 'google_geocode' && facility.osm_checked_at != null;
  let confidence: ScoredGem['confidence'] =
    dataGaps >= 2 ? 'low' : dataGaps === 1 && registryConf === 'high' ? 'medium' : registryConf;
  if (apiVerified && dataGaps === 0 && confidence === 'medium') confidence = 'high';

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
  states?: string[];
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
      if (filters.states?.length && !filters.states.includes(g.facility.state ?? 'AB')) return false;
      return true;
    })
    .sort((a, b) => b.total - a.total);
}

// ────────────────────────────────────────────────────────────────────────────
// Listing gem-signals (shared spec for gem-listing-scanner + UI)
// ────────────────────────────────────────────────────────────────────────────
// Deterministic keyword scoring for scraped real-estate listings. The edge
// function mirrors this table (Deno can't import from src/); keep the two in
// sync — the unit tests here are the source of truth for the weights.
export const LISTING_SIGNALS: { pattern: RegExp; signal: string; weight: number }[] = [
  { pattern: /\bsubstation\b/i, signal: 'substation', weight: 25 },
  { pattern: /\b\d+(\.\d+)?\s*(mw|megawatt)/i, signal: 'mw_capacity', weight: 25 },
  { pattern: /\b\d+(\.\d+)?\s*(mva|kva)\b/i, signal: 'transformer_capacity', weight: 20 },
  { pattern: /\btransmission\s+line/i, signal: 'transmission_line', weight: 15 },
  // Allow one descriptive word between the status and the asset noun:
  // "former chemical plant", "closed steel mill", "idled paper facility".
  { pattern: /\b(former|closed|decommissioned|idled?|shuttered)\s+(\w+\s+)?(plant|mill|smelter|refinery|factory|facility)/i, signal: 'former_plant', weight: 20 },
  { pattern: /\b(heavy|industrial)\s+power\b/i, signal: 'heavy_power', weight: 10 },
  { pattern: /\bhigh[\s-]?voltage\b/i, signal: 'high_voltage', weight: 10 },
  { pattern: /\brail\s*(spur|served|access)/i, signal: 'rail_access', weight: 8 },
  { pattern: /\bnatural\s+gas\s+(line|service|pipeline)/i, signal: 'gas_service', weight: 6 },
  { pattern: /\bdata\s*cent(er|re)\s*(ready|zoned|approved)/i, signal: 'dc_ready', weight: 12 },
  { pattern: /\bpower\s+(purchase|contract|agreement|allocation)\b/i, signal: 'power_contract', weight: 12 },
  { pattern: /\bcrypto|bitcoin|mining\s+facility\b/i, signal: 'crypto_history', weight: 8 },
];

export interface ListingSignalResult {
  signals: string[];
  score: number; // 0–100, capped
}

export function scoreListingText(text: string): ListingSignalResult {
  const signals: string[] = [];
  let score = 0;
  for (const { pattern, signal, weight } of LISTING_SIGNALS) {
    if (pattern.test(text)) {
      signals.push(signal);
      score += weight;
    }
  }
  return { signals, score: Math.min(100, score) };
}

// ────────────────────────────────────────────────────────────────────────────
// Distress score
// ────────────────────────────────────────────────────────────────────────────
// Combines every "this facility is in trouble" signal we already track —
// status, satellite NDVI trend, status_as_of recency — into a single 0–100
// score so the Hidden Gems list can be sorted by partner-outreach priority.
// Every contributing factor is named in `factors` for transparency.

export interface DistressResult {
  score: number; // 0–100, higher = more likely partner target
  band: 'severe' | 'elevated' | 'watch' | 'quiet' | 'unknown';
  factors: string[];
}

export function computeDistressScore(facility: FacilityRow): DistressResult {
  let score = 0;
  const factors: string[] = [];

  // Operating-state signal — registry-known closures and idlings.
  switch (facility.status) {
    case 'closed':
      score += 55; factors.push('status: closed'); break;
    case 'announced_closure':
      score += 50; factors.push('status: closure announced'); break;
    case 'idle':
      score += 45; factors.push('status: idle'); break;
    case 'curtailed':
      score += 30; factors.push('status: curtailed'); break;
    case 'for_sale':
      score += 35; factors.push('status: for sale'); break;
    case 'operating':
      // Operating is the null signal — no contribution.
      break;
    default:
      // unknown — no contribution, but worth marking the band.
      break;
  }

  // How recently the status was confirmed — stale rows are less actionable.
  if (facility.status_as_of) {
    const days = (Date.now() - new Date(facility.status_as_of).getTime()) / 86400000;
    if (days <= 180) factors.push(`status confirmed ${Math.round(days)}d ago`);
    else if (days <= 540) { score -= 5; factors.push(`status ${Math.round(days / 30)}mo stale`); }
    else { score -= 10; factors.push(`status >18mo stale`); }
  }

  // Satellite closure signal — written by facility-activity-monitor. Already
  // 0–100 from Sentinel-2 NDVI trend; we blend it in at 40% weight so it
  // can't overwhelm a strong registry signal but matters a lot when status
  // is unknown.
  if (typeof facility.activity_trend_score === 'number') {
    const contrib = Math.round(facility.activity_trend_score * 0.4);
    if (contrib > 0) {
      score += contrib;
      factors.push(`satellite NDVI (+${contrib})`);
    }
  }
  if (facility.activity_trend === 'rising_vegetation') {
    factors.push('vegetation reclaiming the site');
  } else if (facility.activity_trend === 'recovering') {
    factors.push('mild activity drop');
  }

  // Low confidence shouldn't be presented as high distress.
  if (facility.confidence === 'low') {
    score = Math.min(score, 60);
    factors.push('low-confidence record');
  }

  const clamped = Math.max(0, Math.min(100, score));

  let band: DistressResult['band'];
  if (facility.status === 'unknown' && facility.activity_trend == null) {
    band = 'unknown';
  } else if (clamped >= 70) band = 'severe';
  else if (clamped >= 45) band = 'elevated';
  else if (clamped >= 20) band = 'watch';
  else band = 'quiet';

  return { score: clamped, band, factors };
}
