import { useState } from "react";
import { Target, Building2, TrendingUp, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface WheelSegment {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
}

export const ScalingGrowthWheel = () => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const segments: WheelSegment[] = [
    {
      id: "capacity-planning",
      icon: Target,
      title: "Strategic Planning",
      description: "Long-term vision and roadmap development for sustainable growth",
      color: "bg-watt-success",
      hoverColor: "hover:bg-watt-success/80"
    },
    {
      id: "site-expansion",
      icon: Building2,
      title: "Infrastructure",
      description: "Physical and technical expansion through brownfield, greenfield, or conversion",
      color: "bg-watt-bitcoin",
      hoverColor: "hover:bg-watt-bitcoin/80"
    },
    {
      id: "capital-raising",
      icon: TrendingUp,
      title: "Capital Growth",
      description: "Funding strategies including debt, equity, and equipment financing",
      color: "bg-watt-coinbase",
      hoverColor: "hover:bg-watt-coinbase/80"
    },
    {
      id: "multi-site-strategy",
      icon: Globe,
      title: "Geographic Reach",
      description: "Multi-market presence and risk diversification across regions",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-500/80"
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Central Circle */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Center */}
        <motion.div 
          className="absolute inset-0 m-auto w-24 h-24 bg-gradient-to-br from-watt-success to-watt-blue rounded-full flex items-center justify-center shadow-lg z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="text-white text-center">
            <div className="text-xl font-bold">Scale</div>
            <div className="text-xs opacity-80">Growth</div>
          </div>
        </motion.div>

        {/* Segments */}
        {segments.map((segment, index) => {
          const angle = (index * 90) - 45; // Position at 45, 135, 225, 315 degrees
          const radians = (angle * Math.PI) / 180;
          const radius = 85; // Distance from center
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;

          return (
            <motion.button
              key={segment.id}
              className={`absolute w-16 h-16 rounded-full ${segment.color} ${segment.hoverColor} flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer`}
              style={{
                left: `calc(50% + ${x}px - 32px)`,
                top: `calc(50% + ${y}px - 32px)`,
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => scrollToSection(segment.id)}
              onMouseEnter={() => setActiveSegment(segment.id)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <segment.icon className="w-6 h-6 text-white" />
            </motion.button>
          );
        })}

        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 256">
          {segments.map((_, index) => {
            const angle1 = ((index * 90) - 45) * Math.PI / 180;
            const angle2 = (((index + 1) * 90) - 45) * Math.PI / 180;
            const innerRadius = 48;
            const outerRadius = 70;
            
            const x1 = 128 + Math.cos(angle1) * innerRadius;
            const y1 = 128 + Math.sin(angle1) * innerRadius;
            const x2 = 128 + Math.cos(angle2) * innerRadius;
            const y2 = 128 + Math.sin(angle2) * innerRadius;

            return (
              <motion.path
                key={index}
                d={`M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-muted-foreground/30"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              />
            );
          })}
        </svg>
      </div>

      {/* Active Segment Info */}
      <motion.div 
        className="mt-6 text-center min-h-[80px]"
        initial={false}
        animate={{ opacity: activeSegment ? 1 : 0.5 }}
      >
        {activeSegment ? (
          <>
            <h4 className="text-lg font-semibold text-foreground">
              {segments.find(s => s.id === activeSegment)?.title}
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {segments.find(s => s.id === activeSegment)?.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hover over a pillar to learn more, click to navigate
          </p>
        )}
      </motion.div>
    </div>
  );
};
