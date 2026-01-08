import { useState, useMemo } from "react";
import { ChevronDown, BookOpen, Bitcoin, Server, Zap, Droplets, CircuitBoard, Volume2, Waves, MapPin, DollarSign, Settings, ShieldAlert, TrendingUp, CheckCircle2, Search, GraduationCap, Receipt, HardHat, Lock, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { useAcademyAuth } from "@/contexts/AcademyAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  title: string;
  anchor?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  lessons: Lesson[];
  category: 'fundamentals' | 'operations' | 'advanced' | 'masterclass';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const curriculum: Module[] = [
  {
    id: "bitcoin",
    title: "Bitcoin Fundamentals",
    description: "Understand Bitcoin, blockchain technology, mining basics, and global adoption.",
    icon: Bitcoin,
    route: "/bitcoin",
    category: "fundamentals",
    difficulty: "Beginner",
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
    description: "Facility design, cooling systems, hardware specifications, and operations.",
    icon: Server,
    route: "/datacenters",
    category: "operations",
    difficulty: "Intermediate",
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
    description: "Monitoring, preventive maintenance, troubleshooting, and team management.",
    icon: Settings,
    route: "/operations",
    category: "operations",
    difficulty: "Intermediate",
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
    description: "Container products, cooling methods, water systems, and waste heat recovery.",
    icon: Droplets,
    route: "/hydro-datacenters",
    category: "advanced",
    difficulty: "Advanced",
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
    id: "strategic-operations",
    title: "Strategic Operations Masterclass",
    description: "Complete lifecycle from site selection to multi-site portfolio management. Combines site selection, risk management, and scaling strategies.",
    icon: GraduationCap,
    route: "/strategic-operations",
    category: "masterclass",
    difficulty: "Advanced",
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
    description: "Master tax optimization and insurance strategies for Bitcoin mining and traditional data centers. Featuring our Alberta 45MW facility case study.",
    icon: Receipt,
    route: "/taxes-insurance",
    category: "masterclass",
    difficulty: "Advanced",
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
    description: "Navigate Alberta's regulatory framework for Bitcoin mining facilities. Using our real 45MW Lamont County site with actual permits and requirements.",
    icon: HardHat,
    route: "/engineering-permitting",
    category: "masterclass",
    difficulty: "Advanced",
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
    description: "Network infrastructure design for Bitcoin mining facilities. ISP selection, redundancy, VLAN design, and pool connectivity using our Alberta 45MW site.",
    icon: Network,
    route: "/networking",
    category: "masterclass",
    difficulty: "Advanced",
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

const categories = [
  { key: 'all', label: 'All Modules', count: curriculum.length },
  { key: 'masterclass', label: 'Masterclass', count: curriculum.filter(m => m.category === 'masterclass').length },
  { key: 'fundamentals', label: 'Fundamentals', count: curriculum.filter(m => m.category === 'fundamentals').length },
  { key: 'operations', label: 'Operations', count: curriculum.filter(m => m.category === 'operations').length },
  { key: 'advanced', label: 'Advanced', count: curriculum.filter(m => m.category === 'advanced').length },
];

const difficultyBadges = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-600' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
};

const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { academyUser } = useAcademyAuth();
  const { getModuleProgress, allProgress } = useAllModulesProgress();
  
  const progress = getModuleProgress(module.id, module.lessons.length);
  const moduleProgress = allProgress[module.id];
  const completedSections = moduleProgress?.completedSections || [];
  const diffBadge = difficultyBadges[module.difficulty];
  
  const isEmailVerified = academyUser?.is_email_verified ?? false;

  const handleLessonClick = (lesson: Lesson) => {
    if (!isEmailVerified) {
      toast({
        title: 'Email Verification Required',
        description: 'Please verify your email to access course content.',
        variant: 'destructive'
      });
      return;
    }
    if (lesson.anchor) {
      navigate(`${module.route}#${lesson.anchor}`);
    } else {
      navigate(module.route);
    }
  };

  const handleStartModule = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEmailVerified) {
      toast({
        title: 'Email Verification Required',
        description: 'Please verify your email to start courses.',
        variant: 'destructive'
      });
      return;
    }
    navigate(module.route);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-card",
        progress.isComplete && "ring-2 ring-green-500/20"
      )}
    >
      {/* Module Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              progress.isComplete ? "bg-green-500/10" : "bg-primary/10"
            )}>
              <module.icon className={cn(
                "w-5 h-5",
                progress.isComplete ? "text-green-600" : "text-primary"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{module.title}</h3>
                {progress.isComplete && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-sm mb-4">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", diffBadge.bg, diffBadge.text)}>
            {module.difficulty}
          </span>
          <span className="text-muted-foreground">{module.lessons.length} lessons</span>
          {progress.isStarted && !progress.isComplete && (
            <span className="text-primary font-medium">{progress.percentage}% complete</span>
          )}
        </div>

        {/* Progress bar */}
        {progress.isStarted && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div 
              className={cn(
                "h-full rounded-full",
                progress.isComplete ? "bg-green-500" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {isExpanded ? "Hide" : "View"} Lessons
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          <Button
            size="sm"
            onClick={handleStartModule}
            disabled={!isEmailVerified && !progress.isStarted}
            className={!isEmailVerified ? "opacity-70" : ""}
          >
            {!isEmailVerified ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Verify Email
              </>
            ) : (
              progress.isComplete ? "Review" : progress.isStarted ? "Continue" : "Start"
            )}
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border bg-muted/30">
              {module.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedSections.includes(lesson.anchor || lesson.title);
                return (
                  <button
                    key={lesson.title}
                    onClick={() => handleLessonClick(lesson)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-b-0"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                      isCompleted 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        lessonIndex + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      isCompleted ? "text-muted-foreground" : "text-foreground"
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    return curriculum.filter(module => {
      const matchesCategory = activeCategory === 'all' || module.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="curriculum" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Browse All Modules
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {curriculum.length} modules covering everything from Bitcoin basics to advanced operations. 
            All content is free and accessible without signup.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search modules or lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={activeCategory === cat.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.key)}
                className="whitespace-nowrap"
              >
                {cat.label}
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded text-xs",
                  activeCategory === cat.key 
                    ? "bg-primary-foreground/20" 
                    : "bg-muted"
                )}>
                  {cat.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filteredModules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>

        {/* Empty state */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No modules found matching your search.</p>
            <Button
              variant="link"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
