// Heavy-power industries directory — every industry type the Hidden Gems
// taxonomy understands, with the metadata needed to (a) browse them in the
// AESO Hub directory, (b) compute the production threshold at which a site
// crosses the 10 MW partner-target bar, and (c) link from a directory card
// directly to the Hidden Gems list filtered to that industry.
//
// Source: ENERGY_INTENSITY_MWH_PER_TONNE in src/lib/hidden-gems.ts is the
// single source of truth for the per-tonne electrical intensity. This module
// adds the human-facing context (description, NAICS, capacity unit, typical
// operators in AB+TX) keyed by the same string.

import { ENERGY_INTENSITY_MWH_PER_TONNE } from './hidden-gems';

export type IndustryGroup =
  | 'Pulp, paper & wood'
  | 'Chemicals'
  | 'Metals'
  | 'Minerals'
  | 'Agri & food'
  | 'Compute';

export interface IndustryInfo {
  key: string;
  label: string;
  group: IndustryGroup;
  /** Per-tonne MWh electrical intensity (mirrors hidden-gems taxonomy). */
  intensityMwhPerTonne: number;
  /** Unit the capacity_value field carries for this industry. */
  capacityUnit: 't/yr' | 'm3/yr' | 'MW';
  /** Plain-language description for the directory card. */
  description: string;
  /** Typical NAICS prefix for this industry (informational). */
  naics?: string;
  /** Known operators in Alberta + Texas — illustrative, not exhaustive. */
  operators?: { AB?: string[]; TX?: string[] };
}

const HOURS_PER_YEAR = 8760;
const ASSUMED_UTILIZATION = 0.9;

/**
 * Annual production at which a facility crosses ≥10 MW average electrical
 * load (the partner-target bar). Returns null when intensity is zero (loads
 * that are only published as MW, like datacenters).
 */
export function minProductionFor10MW(info: IndustryInfo): number | null {
  if (info.capacityUnit === 'MW') return null;
  if (info.intensityMwhPerTonne <= 0) return null;
  return Math.round(
    (10 * HOURS_PER_YEAR * ASSUMED_UTILIZATION) / info.intensityMwhPerTonne,
  );
}

/**
 * The directory itself. Keys match ENERGY_INTENSITY_MWH_PER_TONNE so a
 * facility_type from the registry maps 1:1 to a card.
 */
export const INDUSTRY_DIRECTORY: IndustryInfo[] = [
  // ── Pulp, paper & wood products ────────────────────────────────────────────
  {
    key: 'pulp_kraft', label: 'Kraft pulp mill', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.pulp_kraft, capacityUnit: 't/yr',
    description: 'Chemical pulping (kraft process). Net of black-liquor self-generation; the residual electrical demand is still firm and substantial.',
    naics: '32211',
    operators: { AB: ['Mercer Peace River', 'West Fraser Hinton'], TX: [] },
  },
  {
    key: 'pulp_mechanical', label: 'Mechanical pulp / BCTMP', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.pulp_mechanical, capacityUnit: 't/yr',
    description: 'Thermomechanical pulping (TMP/BCTMP). Refiners draw large continuous loads — often the single largest customer on the local grid.',
    naics: '32211',
    operators: { AB: ['Millar Western Whitecourt'], TX: [] },
  },
  {
    key: 'newsprint', label: 'Newsprint mill', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.newsprint, capacityUnit: 't/yr',
    description: 'TMP-based newsprint. Declining demand; many mills are partial-line or idled — high opportunity for re-use of the interconnection.',
    naics: '32212',
  },
  {
    key: 'containerboard', label: 'Container & linerboard', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.containerboard, capacityUnit: 't/yr',
    description: 'Recycled or virgin kraft linerboard / corrugated medium.',
    naics: '32213',
  },
  {
    key: 'osb_panel', label: 'OSB / panel mill', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.osb_panel, capacityUnit: 'm3/yr',
    description: 'Oriented-strand board press lines and dryers; sensitive to housing-cycle demand.',
    operators: { AB: ['West Fraser Slave Lake'], TX: [] },
  },
  {
    key: 'sawmill', label: 'Sawmill', group: 'Pulp, paper & wood',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.sawmill, capacityUnit: 'm3/yr',
    description: 'Lower per-unit intensity; only the largest mills cross the 10 MW threshold.',
  },

  // ── Inorganic / industrial chemicals ───────────────────────────────────────
  {
    key: 'sodium_chlorate', label: 'Sodium chlorate', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.sodium_chlorate, capacityUnit: 't/yr',
    description: 'Electrolysis at ~9 MWh/t — one of the highest-intensity processes outside aluminum. The "45 MW sodium chlorate pattern" that started Hidden Gems.',
    naics: '325180',
  },
  {
    key: 'chlor_alkali', label: 'Chlor-alkali', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.chlor_alkali, capacityUnit: 't/yr',
    description: 'Membrane-cell electrolysis producing chlorine + caustic soda. Continuous load, slow to ramp.',
    naics: '325180',
  },
  {
    key: 'hydrogen_electrolysis', label: 'Electrolytic hydrogen', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.hydrogen_electrolysis, capacityUnit: 't/yr',
    description: 'Green-hydrogen electrolyzers — extreme per-tonne intensity (~55 MWh/t H2). Even small plants are large loads.',
    naics: '325120',
  },
  {
    key: 'ammonia', label: 'Ammonia plant', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.ammonia, capacityUnit: 't/yr',
    description: 'Haber-Bosch; gas is the heat input, electricity drives compression + the ASU. Many AB plants are >50 MW electrical.',
    naics: '325311',
    operators: { AB: ['Nutrien Redwater', 'Yara Belle Plaine'], TX: ['CF Industries Yazoo'] },
  },
  {
    key: 'methanol', label: 'Methanol', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.methanol, capacityUnit: 't/yr',
    description: 'Steam-methane reforming + synthesis; electrical share modest but absolute load large at 1+ Mt/yr scale.',
  },
  {
    key: 'carbon_black', label: 'Carbon black', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.carbon_black, capacityUnit: 't/yr',
    description: 'Furnace-process carbon black; demand tracks tire industry. Heavy auxiliary loads.',
  },
  {
    key: 'soda_ash', label: 'Soda ash (Solvay)', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.soda_ash, capacityUnit: 't/yr',
    description: 'Sodium carbonate via the Solvay process.',
  },
  {
    key: 'pvc', label: 'PVC plant', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.pvc, capacityUnit: 't/yr',
    description: 'EDC/VCM monomer + polymerization; large electrical share at the chlorination step.',
    naics: '325211',
  },
  {
    key: 'polyethylene', label: 'Polyethylene', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.polyethylene, capacityUnit: 't/yr',
    description: 'LDPE/HDPE/LLDPE blends. Texas Gulf Coast hub has many.',
    operators: { TX: ['Dow Freeport', 'ExxonMobil Beaumont'] },
  },
  {
    key: 'polypropylene', label: 'Polypropylene', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.polypropylene, capacityUnit: 't/yr',
    description: 'Polypropylene reactors; similar profile to PE.',
  },
  {
    key: 'ethylene_cracker', label: 'Ethylene cracker', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.ethylene_cracker, capacityUnit: 't/yr',
    description: 'Steam crackers; process heat is gas. Compressor electrical load is large in absolute terms despite the low per-tonne figure.',
    operators: { TX: ['Chevron Phillips Cedar Bayou'] },
  },
  {
    key: 'fertilizer_nitrogen', label: 'Nitrogen fertilizer', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.fertilizer_nitrogen, capacityUnit: 't/yr',
    description: 'Urea / ammonium nitrate / UAN — compression + ASU electrical share.',
    naics: '325311',
  },
  {
    key: 'air_separation', label: 'Air-separation unit (ASU)', group: 'Chemicals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.air_separation, capacityUnit: 't/yr',
    description: 'Cryogenic O2/N2/Ar plants. ASUs run continuously and are common hidden loads inside steel/chemical complexes.',
  },

  // ── Metals (smelting & refining) ───────────────────────────────────────────
  {
    key: 'aluminum_smelter', label: 'Aluminum smelter', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.aluminum_smelter, capacityUnit: 't/yr',
    description: 'Hall-Héroult electrolysis at ~14.5 MWh/t — the highest of all. Any operating smelter is hundreds of MW; idled cells are huge re-use targets.',
    naics: '331313',
  },
  {
    key: 'polysilicon', label: 'Polysilicon (Siemens)', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.polysilicon, capacityUnit: 't/yr',
    description: 'Solar-grade Si by Siemens process at ~50 MWh/t. Highly cyclical with PV demand.',
    operators: { TX: [] },
  },
  {
    key: 'silicon_metal', label: 'Silicon metal', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.silicon_metal, capacityUnit: 't/yr',
    description: 'Submerged-arc furnace; metallurgical-grade Si feedstock.',
  },
  {
    key: 'ferrosilicon', label: 'Ferrosilicon', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.ferrosilicon, capacityUnit: 't/yr',
    description: 'Submerged-arc furnace, ~9 MWh/t at 75% Si grade.',
  },
  {
    key: 'ferromanganese', label: 'Ferromanganese', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.ferromanganese, capacityUnit: 't/yr',
    description: 'High-carbon FeMn via SAF.',
  },
  {
    key: 'ferrochrome', label: 'Ferrochrome', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.ferrochrome, capacityUnit: 't/yr',
    description: 'Charge-chrome via SAF.',
  },
  {
    key: 'metals_refinery', label: 'Metals refinery', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.metals_refinery, capacityUnit: 't/yr',
    description: 'Generic electrorefining / electrowinning — base-metal refinery class.',
  },
  {
    key: 'copper_smelter', label: 'Copper smelter / refinery', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.copper_smelter, capacityUnit: 't/yr',
    description: 'Flash smelting + electrorefining.',
  },
  {
    key: 'zinc_smelter', label: 'Zinc smelter', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.zinc_smelter, capacityUnit: 't/yr',
    description: 'Primary electrolysis route; large hydrometallurgical loads.',
  },
  {
    key: 'lead_smelter', label: 'Lead smelter', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.lead_smelter, capacityUnit: 't/yr',
    description: 'Imperial Smelting Process / Kaldo-type plants.',
  },
  {
    key: 'magnesium_smelter', label: 'Magnesium smelter', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.magnesium_smelter, capacityUnit: 't/yr',
    description: 'Pidgeon-route Mg metal — extreme electrical share.',
  },
  {
    key: 'eaf_steel', label: 'EAF steel mill', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.eaf_steel, capacityUnit: 't/yr',
    description: 'Electric-arc furnace melt + casting. A 1 Mt/yr mill draws ~55 MW average.',
    naics: '331110',
    operators: { TX: ['Steel Dynamics Sinton', 'Nucor Jewett'] },
  },
  {
    key: 'foundry_ferrous', label: 'Ferrous foundry', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.foundry_ferrous, capacityUnit: 't/yr',
    description: 'Induction-melt foundries; tight tie to auto/heavy-equipment cycle.',
  },
  {
    key: 'steel_rolling', label: 'Steel rolling mill', group: 'Metals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.steel_rolling, capacityUnit: 't/yr',
    description: 'Re-heat furnaces + rolling stand drives.',
  },

  // ── Mining & mineral processing ────────────────────────────────────────────
  {
    key: 'cement', label: 'Cement plant', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.cement, capacityUnit: 't/yr',
    description: 'Grinding mills + kiln auxiliaries. Per-tonne figure is modest but kilns are 1+ Mt/yr — large absolute loads.',
    naics: '327310',
    operators: { AB: ['Lehigh Edmonton', 'Lafarge Exshaw'], TX: ['Holcim Midlothian'] },
  },
  {
    key: 'lime', label: 'Lime plant', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.lime, capacityUnit: 't/yr',
    description: 'Calcination of limestone; gas heat, electrical for grinding + auxiliaries.',
  },
  {
    key: 'glass_float', label: 'Float glass', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.glass_float, capacityUnit: 't/yr',
    description: 'Tin-bath float lines; electric boost portion is the addressable load.',
  },
  {
    key: 'glass_container', label: 'Container glass', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.glass_container, capacityUnit: 't/yr',
    description: 'IS-machine forming + electric boost.',
  },
  {
    key: 'potash_mine', label: 'Potash mine + mill', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.potash_mine, capacityUnit: 't/yr',
    description: 'Solution / conventional mining + flotation. Per-tonne low but mill scale is huge.',
  },
  {
    key: 'silica_sand', label: 'Silica sand', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.silica_sand, capacityUnit: 't/yr',
    description: 'Frac-sand processing — heavy equipment drives in the Permian and Eagle Ford.',
  },
  {
    key: 'gold_mine_mill', label: 'Gold mine + mill', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.gold_mine_mill, capacityUnit: 't/yr',
    description: 'Per-tonne ore intensity is low but throughput is massive — million-tonne mills are >25 MW.',
  },
  {
    key: 'gypsum_board', label: 'Gypsum board', group: 'Minerals',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.gypsum_board, capacityUnit: 't/yr',
    description: 'Drywall production; calcination + drying.',
  },

  // ── Agri-processing & food ─────────────────────────────────────────────────
  {
    key: 'canola_crush', label: 'Canola crush', group: 'Agri & food',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.canola_crush, capacityUnit: 't/yr',
    description: 'Oilseed crushing — large in Saskatchewan + AB; below the 10 MW bar except at the very biggest crush plants.',
  },
  {
    key: 'food_processing', label: 'Food processing', group: 'Agri & food',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.food_processing, capacityUnit: 't/yr',
    description: 'Refrigeration-heavy processing lines (meat, dairy, frozen).',
  },
  {
    key: 'cold_storage', label: 'Bulk cold storage', group: 'Agri & food',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.cold_storage, capacityUnit: 'm3/yr',
    description: 'Refrigerated bulk warehouses — many cluster around shipping nodes.',
  },

  // ── Compute / hyper-scale loads ────────────────────────────────────────────
  {
    key: 'datacenter_legacy', label: 'Legacy datacenter', group: 'Compute',
    intensityMwhPerTonne: ENERGY_INTENSITY_MWH_PER_TONNE.datacenter_legacy, capacityUnit: 'MW',
    description: 'Existing datacenter footprints — interconnection in place, often partially loaded. Conversion targets when the tenant churns.',
  },
];

// Lookup helpers ────────────────────────────────────────────────────────────────
export const INDUSTRY_BY_KEY: Record<string, IndustryInfo> = Object.fromEntries(
  INDUSTRY_DIRECTORY.map((i) => [i.key, i]),
);

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  'Pulp, paper & wood',
  'Chemicals',
  'Metals',
  'Minerals',
  'Agri & food',
  'Compute',
];
