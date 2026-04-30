export type PipelineEnergyType = 'Hydro' | 'Natgas' | 'Hybrid' | 'Mix' | 'Solar';
export type PipelineImageKey =
  | 'jinja'
  | 'texas'
  | 'nepal'
  | 'bhutan'
  | 'india'
  | 'newfoundland';
export type PipelineStatus = 'Operating' | 'Under Development' | 'Diligence';

export interface PipelineProject {
  id: string;
  location: string;
  country: string;
  flagEmoji: string;
  lat: number;
  lng: number;
  capacityMw: number;
  energyType: PipelineEnergyType;
  description: string;
  status: PipelineStatus;
  imageKey: PipelineImageKey;
}

export const HQ = { name: 'Calgary HQ', lat: 51.0447, lng: -114.0719 };

export const PIPELINE_PROJECTS: PipelineProject[] = [
  {
    id: 'alberta-heartland',
    location: 'Alberta Heartland 135',
    country: 'Canada',
    flagEmoji: '\uD83C\uDDE8\uD83C\uDDE6',
    lat: 53.6309,
    lng: -113.0996,
    capacityMw: 135,
    energyType: 'Hybrid',
    description: 'Flagship Alberta facility — transmission-connected, ASIC + HPC ready.',
    status: 'Under Development',
    imageKey: 'newfoundland',
  },
  {
    id: 'uganda-jinja',
    location: 'Jinja',
    country: 'Uganda',
    flagEmoji: '\uD83C\uDDFA\uD83C\uDDEC',
    lat: 0.4244,
    lng: 33.2042,
    capacityMw: 400,
    energyType: 'Hydro',
    description: 'Run-of-river hydro on the Nile with direct grid interconnection.',
    status: 'Diligence',
    imageKey: 'jinja',
  },
  {
    id: 'usa-texas',
    location: 'Texas',
    country: 'USA',
    flagEmoji: '\uD83C\uDDFA\uD83C\uDDF8',
    lat: 31.9686,
    lng: -99.9018,
    capacityMw: 536,
    energyType: 'Natgas',
    description: 'On-grid + self-gen natural gas hybrid. ERCOT interconnection.',
    status: 'Diligence',
    imageKey: 'texas',
  },
  {
    id: 'nepal',
    location: 'Nepal Highlands',
    country: 'Nepal',
    flagEmoji: '\uD83C\uDDF3\uD83C\uDDF5',
    lat: 28.3949,
    lng: 84.1240,
    capacityMw: 75,
    energyType: 'Mix',
    description: 'Himalayan grid-connected mixed renewable infrastructure.',
    status: 'Diligence',
    imageKey: 'nepal',
  },
  {
    id: 'bhutan',
    location: 'Bhutan',
    country: 'Bhutan',
    flagEmoji: '\uD83C\uDDE7\uD83C\uDDF9',
    lat: 27.5142,
    lng: 90.4336,
    capacityMw: 175,
    energyType: 'Hydro',
    description: 'Large-scale mountain hydro with stranded surplus capacity.',
    status: 'Diligence',
    imageKey: 'bhutan',
  },
  {
    id: 'india',
    location: 'India',
    country: 'India',
    flagEmoji: '\uD83C\uDDEE\uD83C\uDDF3',
    lat: 20.5937,
    lng: 78.9629,
    capacityMw: 45,
    energyType: 'Solar',
    description: 'Behind-the-meter solar + hydro hybrid system.',
    status: 'Diligence',
    imageKey: 'india',
  },
  {
    id: 'canada-newfoundland',
    location: 'Newfoundland',
    country: 'Canada',
    flagEmoji: '\uD83C\uDDE8\uD83C\uDDE6',
    lat: 53.1355,
    lng: -57.6604,
    capacityMw: 63,
    energyType: 'Hybrid',
    description: 'Coastal wind + hydro hybrid on Canada Atlantic edge.',
    status: 'Diligence',
    imageKey: 'newfoundland',
  },
];

export const TOTAL_MW = PIPELINE_PROJECTS.reduce((s, p) => s + p.capacityMw, 0);
export const UNDER_DEV_MW = PIPELINE_PROJECTS
  .filter(p => p.status === 'Under Development')
  .reduce((s, p) => s + p.capacityMw, 0);
export const COUNTRIES = new Set(PIPELINE_PROJECTS.map(p => p.country)).size;

export const ENERGY_TYPE_COLORS: Record<PipelineEnergyType, { hex: string; bg: string; text: string }> = {
  Hydro:   { hex: '#3B82F6', bg: 'bg-blue-500',     text: 'text-blue-500' },
  Natgas:  { hex: '#F7931A', bg: 'bg-watt-bitcoin', text: 'text-watt-bitcoin' },
  Hybrid:  { hex: '#A855F7', bg: 'bg-purple-500',   text: 'text-purple-500' },
  Mix:     { hex: '#22C55E', bg: 'bg-green-500',    text: 'text-green-500' },
  Solar:   { hex: '#FACC15', bg: 'bg-yellow-400',   text: 'text-yellow-400' },
};
