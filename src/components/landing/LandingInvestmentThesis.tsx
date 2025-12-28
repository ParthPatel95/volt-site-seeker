import { useState, useRef, ReactNode, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { Zap, Server, Cpu, TrendingUp, Shield, Clock, DollarSign, ArrowRight } from 'lucide-react';

// 3D Tilt Card Component
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

const TiltCard = ({ children, className = '', glowColor = 'rgba(0, 194, 203, 0.15)' }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / rect.width;
    const percentY = (e.clientY - centerY) / rect.height;
    mouseX.set(percentX);
    mouseY.set(percentY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-300"
          style={{ background: glowColor, opacity: isHovered ? 0.6 : 0 }}
        />
        
        {/* Card content */}
        <div className="relative z-10 bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          {children}
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 55%, transparent 60%)',
              transform: 'translateX(-100%)',
            }}
            animate={{ x: isHovered ? ['0%', '200%'] : '-100%' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// Animated Cost Bar Component
const CostBar = ({ label, value, maxValue, color, delay, savings }: { 
  label: string; 
  value: number; 
  maxValue: number; 
  color: string; 
  delay: number;
  savings?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const percentage = (value / maxValue) * 100;

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-watt-navy">${value}M/MW</span>
          {savings && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {savings}
            </span>
          )}
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${percentage}%` : 0 }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Stage data
const stages = [
  {
    stage: 1,
    title: "Acquire",
    subtitle: "Stranded Power Assets",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    glowColor: "rgba(245, 158, 11, 0.2)",
    points: [
      "Identify underutilized grid capacity",
      "Negotiate power purchase agreements",
      "Secure land rights & permits"
    ]
  },
  {
    stage: 2,
    title: "Monetize",
    subtitle: "Bitcoin Mining Operations",
    icon: Server,
    color: "text-watt-accent",
    bgColor: "bg-cyan-50",
    glowColor: "rgba(0, 194, 203, 0.2)",
    points: [
      "Deploy mining infrastructure",
      "Generate immediate cash flow",
      "Validate grid reliability"
    ]
  },
  {
    stage: 3,
    title: "Transform",
    subtitle: "AI/HPC Premium Exit",
    icon: Cpu,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    glowColor: "rgba(139, 92, 246, 0.2)",
    points: [
      "Upgrade to Tier 3+ standards",
      "Attract hyperscaler tenants",
      "Premium valuation multiples"
    ]
  }
];

const edgeFeatures = [
  { icon: TrendingUp, title: "VoltScout AI", description: "Proprietary site intelligence platform" },
  { icon: Shield, title: "Risk Mitigation", description: "Mining validates before major capex" },
  { icon: Clock, title: "Speed to Revenue", description: "6-month deployment vs 24+ months" },
  { icon: DollarSign, title: "Capital Efficiency", description: "48% lower cost per MW deployed" },
];

export const LandingInvestmentThesis = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-cyan-100/40 to-transparent rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-violet-100/40 to-transparent rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-watt-accent/10 text-watt-accent border border-watt-accent/20 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TrendingUp className="w-4 h-4" />
            Investment Thesis
          </motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-4">
            Stranded Power → Bitcoin Mining →{' '}
            <span className="bg-gradient-to-r from-watt-accent to-violet-500 bg-clip-text text-transparent">
              AI/HPC Premium
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Our proven three-stage approach transforms undervalued power assets into high-margin data center infrastructure.
          </p>
        </motion.div>

        {/* Stages with connecting lines */}
        <div className="relative mb-16 md:mb-20">
          {/* Connecting lines (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <div className="max-w-5xl mx-auto px-20 relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-300 via-cyan-400 to-violet-400"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
              {/* Animated pulse along the line */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-watt-accent rounded-full shadow-lg"
                animate={isInView ? { left: ["0%", "100%"] } : { left: "0%" }}
                transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto relative z-10">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              >
                <TiltCard glowColor={stage.glowColor}>
                  <div className="p-6 md:p-8">
                    {/* Stage number & icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">
                        STAGE {stage.stage}
                      </span>
                      <motion.div
                        className={`w-12 h-12 rounded-xl ${stage.bgColor} flex items-center justify-center`}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                      >
                        <stage.icon className={`w-6 h-6 ${stage.color}`} />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-watt-navy mb-1">{stage.title}</h3>
                    <p className={`text-sm font-medium ${stage.color} mb-4`}>{stage.subtitle}</p>

                    {/* Points */}
                    <ul className="space-y-2">
                      {stage.points.map((point, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-600"
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.15 + i * 0.1 }}
                        >
                          <ArrowRight className={`w-4 h-4 ${stage.color} flex-shrink-0 mt-0.5`} />
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>

                {/* Arrow between cards (mobile) */}
                {index < stages.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Proprietary Edge Section */}
        <motion.div
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-watt-navy text-center mb-8">
            Our Proprietary Edge
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {edgeFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:border-watt-accent/30 transition-all duration-300 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-watt-accent/10 to-violet-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-watt-accent" />
                </div>
                <h4 className="font-semibold text-watt-navy text-sm md:text-base mb-1">{feature.title}</h4>
                <p className="text-xs md:text-sm text-slate-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cost Comparison */}
        <motion.div
          className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h3 className="text-lg font-bold text-watt-navy mb-6 text-center">
            Cost Comparison: Traditional vs WattByte
          </h3>
          <div className="space-y-4">
            <CostBar
              label="Traditional Data Center"
              value={12.5}
              maxValue={12.5}
              color="bg-slate-400"
              delay={1.3}
            />
            <CostBar
              label="WattByte Approach"
              value={6.5}
              maxValue={12.5}
              color="bg-gradient-to-r from-watt-accent to-emerald-400"
              delay={1.5}
              savings="48% Lower"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-watt-accent">
                <AnimatedCounter value={6} prefix="$" suffix="M" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Savings per MW</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-watt-navy">
                <AnimatedCounter value={80} suffix="%" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Faster Deploy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-violet-500">
                Tier 3+
              </div>
              <div className="text-xs text-slate-500 mt-1">Performance</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingInvestmentThesis;
