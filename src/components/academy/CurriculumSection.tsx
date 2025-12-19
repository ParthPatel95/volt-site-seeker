import { useState, useMemo } from "react";
import { ChevronDown, BookOpen, Bitcoin, Server, Zap, Droplets, CircuitBoard, Volume2, Waves, MapPin, DollarSign, Settings, ShieldAlert, TrendingUp, CheckCircle2, Search, Filter } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  category: 'fundamentals' | 'operations' | 'advanced';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

const curriculum: Module[] = [
  {
    id: "bitcoin",
    title: "Bitcoin Fundamentals",
    icon: Bitcoin,
    color: "watt-bitcoin",
    route: "/bitcoin",
    category: "fundamentals",
    difficulty: "Beginner",
    duration: "~60 min",
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
    icon: Zap,
    color: "watt-success",
    route: "/aeso-101",
    category: "fundamentals",
    difficulty: "Beginner",
    duration: "~45 min",
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
    icon: DollarSign,
    color: "watt-emerald",
    route: "/mining-economics",
    category: "fundamentals",
    difficulty: "Beginner",
    duration: "~40 min",
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
    id: "datacenters",
    title: "Mining Infrastructure",
    icon: Server,
    color: "watt-blue",
    route: "/datacenters",
    category: "operations",
    difficulty: "Intermediate",
    duration: "~50 min",
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
    icon: CircuitBoard,
    color: "watt-coinbase",
    route: "/electrical-infrastructure",
    category: "operations",
    difficulty: "Intermediate",
    duration: "~60 min",
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
    id: "operations",
    title: "Operations & Maintenance",
    icon: Settings,
    color: "watt-blue",
    route: "/operations",
    category: "operations",
    difficulty: "Intermediate",
    duration: "~40 min",
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
    icon: Volume2,
    color: "watt-purple",
    route: "/noise-management",
    category: "operations",
    difficulty: "Intermediate",
    duration: "~50 min",
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
    id: "hydro",
    title: "Hydro Cooling Systems",
    icon: Droplets,
    color: "watt-blue",
    route: "/hydro-datacenters",
    category: "advanced",
    difficulty: "Advanced",
    duration: "~60 min",
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
    icon: Waves,
    color: "watt-cyan",
    route: "/immersion-cooling",
    category: "advanced",
    difficulty: "Advanced",
    duration: "~50 min",
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
    category: "advanced",
    difficulty: "Advanced",
    duration: "~45 min",
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
    id: "risk-management",
    title: "Risk Management",
    icon: ShieldAlert,
    color: "watt-bitcoin",
    route: "/risk-management",
    category: "advanced",
    difficulty: "Advanced",
    duration: "~40 min",
    lessons: [
      { title: "Risk Fundamentals", anchor: "intro" },
      { title: "Market Risk Analysis", anchor: "market-risk" },
      { title: "Operational Risk", anchor: "operational-risk" },
      { title: "Regulatory & Compliance", anchor: "regulatory-risk" },
      { title: "Financial Risk", anchor: "financial-risk" },
      { title: "Risk Assessment Matrix", anchor: "risk-matrix" },
      { title: "Insurance & Risk Transfer", anchor: "insurance" },
      { title: "Crisis Management", anchor: "crisis" },
    ],
  },
  {
    id: "scaling-growth",
    title: "Scaling & Growth",
    icon: TrendingUp,
    color: "watt-success",
    route: "/scaling-growth",
    category: "advanced",
    difficulty: "Advanced",
    duration: "~40 min",
    lessons: [
      { title: "Scaling Fundamentals", anchor: "scaling-intro" },
      { title: "Capacity Planning", anchor: "capacity-planning" },
      { title: "Site Expansion Strategies", anchor: "site-expansion" },
      { title: "Multi-Site Strategy", anchor: "multi-site" },
      { title: "Capital Raising", anchor: "capital-raising" },
      { title: "Partnership Models", anchor: "partnerships" },
      { title: "Mergers & Acquisitions", anchor: "mergers-acquisitions" },
      { title: "Growth Resources", anchor: "scaling-cta" },
    ],
  },
];

const difficultyBadges = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-600' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
};

const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { getModuleProgress, allProgress } = useAllModulesProgress();
  const colors = colorClasses[module.color];
  
  const progress = getModuleProgress(module.id, module.lessons.length);
  const moduleProgress = allProgress[module.id];
  const completedSections = moduleProgress?.completedSections || [];
  const diffBadge = difficultyBadges[module.difficulty];

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.anchor) {
      navigate(`${module.route}#${lesson.anchor}`);
    } else {
      navigate(module.route);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow",
        progress.isComplete && "ring-2 ring-green-500/20"
      )}
    >
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`module-${module.id}-lessons`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bgLight} flex items-center justify-center relative`}>
            <module.icon className={`w-6 h-6 ${colors.text}`} />
            {progress.isComplete && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-watt-navy">
                {module.title}
              </h3>
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                diffBadge.bg, diffBadge.text
              )}>
                {module.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{module.lessons.length} lessons</span>
              <span>•</span>
              <span>{module.duration}</span>
              {progress.isStarted && (
                <>
                  <span>•</span>
                  <span className={cn(
                    "font-medium",
                    progress.isComplete ? "text-green-600" : "text-primary"
                  )}>
                    {progress.percentage}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Progress bar */}
      {progress.isStarted && (
        <div className="h-1 bg-muted -mt-1">
          <motion.div 
            className={cn(
              "h-full transition-all duration-300",
              progress.isComplete ? "bg-green-500" : "bg-primary"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
          />
        </div>
      )}

      {/* Lessons List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            id={`module-${module.id}-lessons`}
          >
            <div className="border-t border-border">
              {module.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedSections.includes(lesson.anchor || lesson.title);
                return (
                  <button
                    key={lesson.title}
                    onClick={() => handleLessonClick(lesson)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-b-0 group"
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                      isCompleted 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        lessonIndex + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors flex-1",
                      isCompleted 
                        ? "text-green-600" 
                        : "text-foreground group-hover:text-primary"
                    )}>
                      {lesson.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CurriculumSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { getModuleProgress } = useAllModulesProgress();
  
  const totalLessons = curriculum.reduce((acc, module) => acc + module.lessons.length, 0);
  
  // Calculate total completed lessons
  const completedLessons = curriculum.reduce((acc, module) => {
    const progress = getModuleProgress(module.id, module.lessons.length);
    return acc + Math.round((progress.percentage / 100) * module.lessons.length);
  }, 0);

  // Filter modules based on search and category
  const filteredModules = useMemo(() => {
    return curriculum.filter(module => {
      const matchesSearch = searchQuery === "" || 
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeTab === "all" || module.category === activeTab;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab]);

  const categoryCount = {
    all: curriculum.length,
    fundamentals: curriculum.filter(m => m.category === 'fundamentals').length,
    operations: curriculum.filter(m => m.category === 'operations').length,
    advanced: curriculum.filter(m => m.category === 'advanced').length,
  };

  return (
    <section id="curriculum" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              {completedLessons > 0 ? (
                <span>{completedLessons}/{totalLessons} Lessons Completed</span>
              ) : (
                <span>{totalLessons} Total Lessons</span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Full Curriculum
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore all modules and lessons. Click any lesson to jump directly to that topic.
            </p>
          </div>
        </ScrollReveal>

        {/* Search and Filter Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules and lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full justify-start bg-muted/50 p-1">
              <TabsTrigger value="all" className="gap-2">
                All <span className="text-xs text-muted-foreground">({categoryCount.all})</span>
              </TabsTrigger>
              <TabsTrigger value="fundamentals" className="gap-2">
                Fundamentals <span className="text-xs text-muted-foreground">({categoryCount.fundamentals})</span>
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-2">
                Operations <span className="text-xs text-muted-foreground">({categoryCount.operations})</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                Advanced <span className="text-xs text-muted-foreground">({categoryCount.advanced})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Module Cards */}
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredModules.map((module, index) => (
              <ModuleCard key={module.id} module={module} index={index} />
            ))}
          </AnimatePresence>

          {filteredModules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No modules found matching "{searchQuery}"</p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
