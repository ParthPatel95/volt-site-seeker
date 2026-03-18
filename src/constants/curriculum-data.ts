import {
  Bitcoin, Zap, DollarSign, Server, CircuitBoard, Settings,
  Volume2, Droplets, Waves, GraduationCap, Receipt, HardHat, Network
} from "lucide-react";

export type ModuleCategory = 'fundamentals' | 'operations' | 'advanced' | 'masterclass';
export type ModuleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  title: string;
  anchor?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  lessons: Lesson[];
  category: ModuleCategory;
  difficulty: ModuleDifficulty;
  estimatedMinutes: number;
  prerequisites?: string[]; // module IDs
  phase: number; // 1-4 for learning path
}

export const ACADEMY_CURRICULUM: CurriculumModule[] = [
  // Phase 1 — Foundations
  {
    id: "bitcoin",
    title: "Bitcoin Fundamentals",
    description: "Understand Bitcoin, blockchain technology, mining basics, and global adoption.",
    icon: Bitcoin,
    route: "/bitcoin",
    category: "fundamentals",
    difficulty: "Beginner",
    estimatedMinutes: 60,
    phase: 1,
    lessons: [
      { title: "What is Bitcoin", anchor: "what-is-bitcoin" },
      { title: "Bitcoin History", anchor: "history" },
      { title: "How It Works", anchor: "how-it-works" },
      { title: "Wallets & Storage", anchor: "wallets" },
      { title: "Mining Basics", anchor: "mining" },
      { title: "Datacenter Cooling", anchor: "cooling" },
      { title: "Mining Pools", anchor: "pools" },
      { title: "Mining Sustainability", anchor: "sustainability" },
      { title: "Bitcoin Economics", anchor: "economics" },
      { title: "Benefits & Use Cases", anchor: "benefits" },
      { title: "Global Adoption", anchor: "adoption" },
      { title: "Future Outlook", anchor: "future" },
    ],
  },
  {
    id: "aeso",
    title: "Alberta Energy Market",
    description: "Master AESO operations, pool pricing, and electricity cost optimization.",
    icon: Zap,
    route: "/aeso-101",
    category: "fundamentals",
    difficulty: "Beginner",
    estimatedMinutes: 50,
    phase: 1,
    lessons: [
      { title: "What is AESO", anchor: "what-is-aeso" },
      { title: "Market Participants", anchor: "market-participants" },
      { title: "Pool Pricing Explained", anchor: "pool-pricing" },
      { title: "Price Trends & Analysis", anchor: "price-trends" },
      { title: "12CP Explained", anchor: "twelve-cp" },
      { title: "Savings Programs", anchor: "savings-programs" },
      { title: "Rate 65 Explained", anchor: "rate-65" },
      { title: "Grid Operations", anchor: "grid-operations" },
      { title: "Generation Mix", anchor: "generation-mix" },
      { title: "Take Action", anchor: "cta" },
    ],
  },
  {
    id: "mining-economics",
    title: "Mining Economics",
    description: "Revenue drivers, cost analysis, profitability modeling, and ROI calculations.",
    icon: DollarSign,
    route: "/mining-economics",
    category: "fundamentals",
    difficulty: "Beginner",
    estimatedMinutes: 40,
    phase: 1,
    lessons: [
      { title: "Economics Fundamentals", anchor: "intro" },
      { title: "Revenue Drivers", anchor: "revenue" },
      { title: "Cost Structure Analysis", anchor: "costs" },
      { title: "Profitability Modeling", anchor: "profitability" },
      { title: "Break-Even Analysis", anchor: "breakeven" },
      { title: "Hardware ROI", anchor: "hardware-roi" },
      { title: "Difficulty Adjustments", anchor: "difficulty" },
      { title: "Strategic Decisions", anchor: "strategy" },
    ],
  },

  // Phase 2 — Infrastructure
  {
    id: "datacenters",
    title: "Mining Infrastructure",
    description: "Facility design, cooling systems, hardware specifications, and operations.",
    icon: Server,
    route: "/datacenters",
    category: "operations",
    difficulty: "Intermediate",
    estimatedMinutes: 55,
    phase: 2,
    prerequisites: ["bitcoin"],
    lessons: [
      { title: "Energy Source to Facility", anchor: "power-journey" },
      { title: "Electrical Infrastructure", anchor: "electrical" },
      { title: "Facility Design & Layout", anchor: "facility-layout" },
      { title: "Airflow & Containment", anchor: "airflow" },
      { title: "Cooling Systems Deep Dive", anchor: "cooling" },
      { title: "Mining Hardware", anchor: "hardware" },
      { title: "Operations & Monitoring", anchor: "operations" },
      { title: "Datacenter Economics", anchor: "economics" },
      { title: "Interactive Facility Tour", anchor: "tour" },
      { title: "Next Steps", anchor: "cta" },
    ],
  },
  {
    id: "electrical",
    title: "Electrical Infrastructure",
    description: "Power distribution, transformers, switchgear, and safety protocols.",
    icon: CircuitBoard,
    route: "/electrical-infrastructure",
    category: "operations",
    difficulty: "Intermediate",
    estimatedMinutes: 65,
    phase: 2,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Electrical Fundamentals", anchor: "fundamentals" },
      { title: "Utility Grid Connection", anchor: "grid-connection" },
      { title: "High Voltage Transmission", anchor: "high-voltage" },
      { title: "Power Transformers", anchor: "transformers" },
      { title: "Medium Voltage Switchgear", anchor: "switchgear" },
      { title: "Low Voltage Distribution", anchor: "low-voltage" },
      { title: "Power Distribution Units", anchor: "pdus" },
      { title: "Mining Equipment Power", anchor: "mining-power" },
      { title: "Power Quality", anchor: "power-quality" },
      { title: "Grounding & Bonding", anchor: "grounding" },
      { title: "Arc Flash Safety", anchor: "arc-flash" },
      { title: "Redundancy Architectures", anchor: "redundancy" },
    ],
  },
  {
    id: "hydro",
    title: "Hydro Cooling Systems",
    description: "Container products, cooling methods, water systems, and waste heat recovery.",
    icon: Droplets,
    route: "/hydro-datacenters",
    category: "advanced",
    difficulty: "Advanced",
    estimatedMinutes: 60,
    phase: 2,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Why Hydro-cooling", anchor: "advantages" },
      { title: "Container Products", anchor: "containers" },
      { title: "Cooling Methods", anchor: "cooling-methods" },
      { title: "Site Selection", anchor: "site-selection" },
      { title: "Modular Layout Design", anchor: "layout" },
      { title: "Water Systems", anchor: "water-systems" },
      { title: "Electrical Infrastructure", anchor: "electrical" },
      { title: "Network & Security", anchor: "network" },
      { title: "Construction & Acceptance", anchor: "construction" },
      { title: "Economics & ROI", anchor: "economics" },
      { title: "Waste Heat Recovery", anchor: "waste-heat" },
      { title: "Implementation Guide", anchor: "cta" },
    ],
  },
  {
    id: "immersion",
    title: "Immersion Cooling",
    description: "Single vs two-phase cooling, dielectric fluids, and overclocking potential.",
    icon: Waves,
    route: "/immersion-cooling",
    category: "advanced",
    difficulty: "Advanced",
    estimatedMinutes: 50,
    phase: 2,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Introduction to Immersion", anchor: "introduction" },
      { title: "Single vs Two-Phase Cooling", anchor: "types" },
      { title: "Dielectric Fluid Selection", anchor: "fluids" },
      { title: "Hardware Preparation", anchor: "hardware-prep" },
      { title: "Tank Design & Systems", anchor: "tank-systems" },
      { title: "Heat Transfer Engineering", anchor: "heat-transfer" },
      { title: "Overclocking Potential", anchor: "overclocking" },
      { title: "Economics & ROI", anchor: "economics" },
      { title: "Container Systems (HD5)", anchor: "containers" },
      { title: "Operations & Maintenance", anchor: "maintenance" },
    ],
  },

  // Phase 3 — Operations
  {
    id: "operations",
    title: "Operations & Maintenance",
    description: "Monitoring, preventive maintenance, troubleshooting, and team management.",
    icon: Settings,
    route: "/operations",
    category: "operations",
    difficulty: "Intermediate",
    estimatedMinutes: 45,
    phase: 3,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Operations Fundamentals", anchor: "intro" },
      { title: "Monitoring Systems", anchor: "monitoring" },
      { title: "Preventive Maintenance", anchor: "maintenance" },
      { title: "Troubleshooting & Diagnostics", anchor: "troubleshooting" },
      { title: "Performance Optimization", anchor: "optimization" },
      { title: "Team Structure & Staffing", anchor: "team" },
      { title: "Safety Protocols", anchor: "safety" },
      { title: "Documentation & Reporting", anchor: "documentation" },
    ],
  },
  {
    id: "noise",
    title: "Noise Management",
    description: "Sound fundamentals, regulatory standards, and mitigation techniques.",
    icon: Volume2,
    route: "/noise-management",
    category: "operations",
    difficulty: "Intermediate",
    estimatedMinutes: 50,
    phase: 3,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Sound Fundamentals", anchor: "fundamentals" },
      { title: "Mining Noise Sources", anchor: "noise-sources" },
      { title: "Cumulative Noise Calculations", anchor: "cumulative" },
      { title: "Regulatory Standards", anchor: "standards" },
      { title: "Distance Attenuation", anchor: "distance" },
      { title: "Mitigation Techniques", anchor: "mitigation" },
      { title: "Site Layout Optimization", anchor: "site-layout" },
      { title: "Monitoring & Measurement", anchor: "monitoring" },
      { title: "Environmental Impact", anchor: "environmental" },
      { title: "45MW Alberta Case Study", anchor: "case-study" },
    ],
  },

  // Phase 4 — Masterclass
  {
    id: "strategic-operations",
    title: "Strategic Operations Masterclass",
    description: "Complete lifecycle from site selection to multi-site portfolio management.",
    icon: GraduationCap,
    route: "/strategic-operations",
    category: "masterclass",
    difficulty: "Advanced",
    estimatedMinutes: 40,
    phase: 4,
    prerequisites: ["bitcoin", "mining-economics", "datacenters"],
    lessons: [
      { title: "Strategic Foundations", anchor: "intro" },
      { title: "Power Infrastructure", anchor: "track-1" },
      { title: "Risk Assessment", anchor: "track-2" },
      { title: "Project Execution", anchor: "track-3" },
      { title: "Scaling Operations", anchor: "track-4" },
      { title: "Capital & Growth", anchor: "track-5" },
    ],
  },
  {
    id: "taxes-insurance",
    title: "Taxes & Insurance Masterclass",
    description: "Tax optimization and insurance strategies for Bitcoin mining and traditional data centers.",
    icon: Receipt,
    route: "/taxes-insurance",
    category: "masterclass",
    difficulty: "Advanced",
    estimatedMinutes: 55,
    phase: 4,
    prerequisites: ["mining-economics"],
    lessons: [
      { title: "Introduction", anchor: "intro" },
      { title: "Tax Jurisdictions", anchor: "jurisdictions" },
      { title: "Corporate Structure", anchor: "corporate-structure" },
      { title: "Capital Expenses (CCA)", anchor: "capex" },
      { title: "Operating Expenses", anchor: "opex" },
      { title: "Crypto Tax Treatment", anchor: "crypto-tax" },
      { title: "Incentives & Credits", anchor: "incentives" },
      { title: "Property Insurance", anchor: "property-insurance" },
      { title: "Liability Insurance", anchor: "liability-insurance" },
      { title: "45MW Case Study", anchor: "case-study" },
    ],
  },
  {
    id: "engineering-permitting",
    title: "Engineering & Permitting Masterclass",
    description: "Navigate Alberta's regulatory framework for Bitcoin mining facilities.",
    icon: HardHat,
    route: "/engineering-permitting",
    category: "masterclass",
    difficulty: "Advanced",
    estimatedMinutes: 55,
    phase: 4,
    prerequisites: ["datacenters", "electrical"],
    lessons: [
      { title: "Introduction", anchor: "intro" },
      { title: "Regulatory Landscape", anchor: "regulatory" },
      { title: "Municipal Permits", anchor: "municipal" },
      { title: "Safety Codes", anchor: "safety-codes" },
      { title: "AESO Connection", anchor: "aeso" },
      { title: "AUC Approval", anchor: "auc" },
      { title: "Electrical Engineering", anchor: "electrical" },
      { title: "Environmental Compliance", anchor: "environmental" },
      { title: "Site Engineering", anchor: "site" },
      { title: "Timeline & Costs", anchor: "timeline" },
    ],
  },
  {
    id: "networking",
    title: "Networking Masterclass",
    description: "Network infrastructure design for Bitcoin mining facilities.",
    icon: Network,
    route: "/networking",
    category: "masterclass",
    difficulty: "Advanced",
    estimatedMinutes: 50,
    phase: 4,
    prerequisites: ["datacenters"],
    lessons: [
      { title: "Introduction", anchor: "intro" },
      { title: "ISP Options", anchor: "connectivity" },
      { title: "Redundancy", anchor: "redundancy" },
      { title: "Topology", anchor: "topology" },
      { title: "IP Management", anchor: "ip-management" },
      { title: "Pool Connectivity", anchor: "pool-connectivity" },
      { title: "Security", anchor: "security" },
      { title: "Monitoring", anchor: "monitoring" },
      { title: "Hardware", anchor: "hardware" },
      { title: "45MW Case Study", anchor: "case-study" },
    ],
  },
];

// Derived constants
export const TOTAL_MODULES = ACADEMY_CURRICULUM.length;
export const TOTAL_LESSONS = ACADEMY_CURRICULUM.reduce((sum, m) => sum + m.lessons.length, 0);
export const TOTAL_HOURS = Math.round(ACADEMY_CURRICULUM.reduce((sum, m) => sum + m.estimatedMinutes, 0) / 60);

// Helper to get module info for progress tracking (compatible with existing hooks)
export const getModulesForProgress = () =>
  ACADEMY_CURRICULUM.map(m => ({
    id: m.id,
    title: m.title,
    route: m.route,
    totalSections: m.lessons.length,
  }));

// Categories in beginner-first order
export const CURRICULUM_CATEGORIES = [
  { key: 'all', label: 'All Modules', count: ACADEMY_CURRICULUM.length },
  { key: 'fundamentals', label: 'Fundamentals', count: ACADEMY_CURRICULUM.filter(m => m.category === 'fundamentals').length },
  { key: 'operations', label: 'Operations', count: ACADEMY_CURRICULUM.filter(m => m.category === 'operations').length },
  { key: 'advanced', label: 'Advanced', count: ACADEMY_CURRICULUM.filter(m => m.category === 'advanced').length },
  { key: 'masterclass', label: 'Masterclass', count: ACADEMY_CURRICULUM.filter(m => m.category === 'masterclass').length },
] as const;

// Learning path phases
export const LEARNING_PHASES = [
  { phase: 1, title: "Foundations", description: "Core concepts and market fundamentals" },
  { phase: 2, title: "Infrastructure", description: "Facility design, electrical, and cooling systems" },
  { phase: 3, title: "Operations", description: "Day-to-day management and maintenance" },
  { phase: 4, title: "Masterclass", description: "Advanced strategy, compliance, and scaling" },
] as const;

export const DIFFICULTY_BADGES = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-600' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
} as const;
