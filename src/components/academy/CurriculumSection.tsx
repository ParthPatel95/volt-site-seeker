import { useState } from "react";
import { ChevronDown, BookOpen, Bitcoin, Server, Zap, Droplets, CircuitBoard, Volume2, Waves, MapPin, DollarSign, Settings } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Explicit color classes to avoid Tailwind purge issues
const colorClasses = {
  "watt-bitcoin": {
    bgLight: "bg-watt-bitcoin/10",
    text: "text-watt-bitcoin",
  },
  "watt-blue": {
    bgLight: "bg-watt-blue/10",
    text: "text-watt-blue",
  },
  "watt-success": {
    bgLight: "bg-watt-success/10",
    text: "text-watt-success",
  },
  "watt-coinbase": {
    bgLight: "bg-watt-coinbase/10",
    text: "text-watt-coinbase",
  },
  "watt-purple": {
    bgLight: "bg-purple-500/10",
    text: "text-purple-500",
  },
  "watt-cyan": {
    bgLight: "bg-cyan-500/10",
    text: "text-cyan-500",
  },
  "watt-indigo": {
    bgLight: "bg-indigo-500/10",
    text: "text-indigo-500",
  },
  "watt-emerald": {
    bgLight: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
} as const;

type ColorKey = keyof typeof colorClasses;

interface Lesson {
  title: string;
  anchor?: string;
}

interface Module {
  id: string;
  title: string;
  icon: React.ElementType;
  color: ColorKey;
  route: string;
  lessons: Lesson[];
}

const curriculum: Module[] = [
  {
    id: "bitcoin",
    title: "Bitcoin Fundamentals",
    icon: Bitcoin,
    color: "watt-bitcoin",
    route: "/bitcoin",
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
      { title: "Getting Started", anchor: "cta" },
    ],
  },
  {
    id: "datacenters",
    title: "Mining Infrastructure",
    icon: Server,
    color: "watt-blue",
    route: "/datacenters",
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
    id: "aeso",
    title: "Alberta Energy Market",
    icon: Zap,
    color: "watt-success",
    route: "/aeso-101",
    lessons: [
      { title: "What is AESO", anchor: "what-is-aeso" },
      { title: "Market Participants", anchor: "participants" },
      { title: "Pool Pricing Explained", anchor: "pool-pricing" },
      { title: "Price Trends & Analysis", anchor: "price-trends" },
      { title: "12CP Explained", anchor: "12cp" },
      { title: "Savings Programs", anchor: "savings" },
      { title: "Rate 65 Explained", anchor: "rate-65" },
      { title: "Grid Operations", anchor: "grid-ops" },
      { title: "Generation Mix", anchor: "generation" },
      { title: "Energy Forecast", anchor: "forecast" },
      { title: "Market Optimization", anchor: "optimization" },
      { title: "Take Action", anchor: "cta" },
    ],
  },
  {
    id: "hydro",
    title: "Hydro Cooling Systems",
    icon: Droplets,
    color: "watt-blue",
    route: "/hydro-datacenters",
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
    id: "electrical",
    title: "Electrical Infrastructure",
    icon: CircuitBoard,
    color: "watt-coinbase",
    route: "/electrical-infrastructure",
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
    id: "noise",
    title: "Noise Management",
    icon: Volume2,
    color: "watt-purple",
    route: "/noise-management",
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
  {
    id: "immersion",
    title: "Immersion Cooling",
    icon: Waves,
    color: "watt-cyan",
    route: "/immersion-cooling",
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
  {
    id: "site-selection",
    title: "Site Selection & Acquisition",
    icon: MapPin,
    color: "watt-indigo",
    route: "/site-selection",
    lessons: [
      { title: "Site Selection Fundamentals", anchor: "intro" },
      { title: "Power Infrastructure", anchor: "power-infrastructure" },
      { title: "Energy Markets Analysis", anchor: "energy-markets" },
      { title: "Regulatory Environment", anchor: "regulatory" },
      { title: "Climate Impact Analysis", anchor: "climate" },
      { title: "Land Acquisition Strategies", anchor: "land-acquisition" },
      { title: "Due Diligence Process", anchor: "due-diligence" },
      { title: "VoltScore™ Site Scoring", anchor: "site-scoring" },
      { title: "Development Timeline", anchor: "timeline" },
    ],
  },
  {
    id: "mining-economics",
    title: "Mining Economics",
    icon: DollarSign,
    color: "watt-emerald",
    route: "/mining-economics",
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
  {
    id: "operations",
    title: "Operations & Maintenance",
    icon: Settings,
    color: "watt-blue",
    route: "/operations",
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
];

const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const navigate = useNavigate();
  const colors = colorClasses[module.color];

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.anchor) {
      navigate(`${module.route}#${lesson.anchor}`);
    } else {
      navigate(module.route);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bgLight} flex items-center justify-center`}>
            <module.icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-watt-navy">
              Module {index + 1}: {module.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {module.lessons.length} lessons
            </p>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Lessons List */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[1000px]" : "max-h-0"
      )}>
        <div className="border-t border-border">
          {module.lessons.map((lesson, lessonIndex) => (
            <button
              key={lesson.title}
              onClick={() => handleLessonClick(lesson)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors text-left border-b border-border/50 last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {lessonIndex + 1}
              </div>
              <span className="text-sm text-watt-navy/80 hover:text-watt-navy">
                {lesson.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CurriculumSection = () => {
  const totalLessons = curriculum.reduce((acc, module) => acc + module.lessons.length, 0);

  return (
    <section id="curriculum" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              {totalLessons} Total Lessons
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Full Curriculum
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore all modules and lessons. Click any lesson to jump directly to that topic.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto space-y-4">
          {curriculum.map((module, index) => (
            <ScrollReveal key={module.id} delay={index * 50}>
              <ModuleCard module={module} index={index} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};