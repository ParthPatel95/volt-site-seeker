import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Settings, Scale, Banknote } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";

const riskCategories = [
  {
    id: "market",
    name: "Market Risk",
    icon: TrendingDown,
    color: "#ef4444",
    href: "#market-risk",
    description: "BTC volatility, hashrate, difficulty"
  },
  {
    id: "operational",
    name: "Operational Risk",
    icon: Settings,
    color: "#f97316",
    href: "#operational-risk",
    description: "Equipment, power, facility"
  },
  {
    id: "regulatory",
    name: "Regulatory Risk",
    icon: Scale,
    color: "#eab308",
    href: "#regulatory-risk",
    description: "Compliance, permits, policy"
  },
  {
    id: "financial",
    name: "Financial Risk",
    icon: Banknote,
    color: "#22c55e",
    href: "#financial-risk",
    description: "Liquidity, leverage, counterparty"
  }
];

export const AnimatedRiskWheel = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);

  const handleClick = (href: string) => {
    setIsSpinning(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ScrollReveal>
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Outer ring animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/30"
          animate={isSpinning ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">Risk</div>
            <div className="text-sm text-muted-foreground">Management</div>
          </div>
        </div>

        {/* Risk segments */}
        {riskCategories.map((category, index) => {
          const Icon = category.icon;
          const angle = (index * 90) - 45; // Position at 45, 135, 225, 315 degrees
          const radius = 42; // % from center
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

          return (
            <motion.button
              key={category.id}
              onClick={() => handleClick(category.href)}
              onHoverStart={() => {
                setHoveredIndex(index);
                setIsSpinning(false);
              }}
              onHoverEnd={() => {
                setHoveredIndex(null);
                setIsSpinning(true);
              }}
              className="absolute flex flex-col items-center gap-1 cursor-pointer group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: hoveredIndex === index ? category.color : `${category.color}20`,
                }}
                animate={isSpinning && hoveredIndex === null ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                <Icon 
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: hoveredIndex === index ? 'white' : category.color }}
                />
              </motion.div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {category.name}
              </span>
              
              {/* Tooltip on hover */}
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-xs text-muted-foreground whitespace-nowrap z-10"
                >
                  {category.description}
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {riskCategories.map((_, index) => {
            const angle1 = (index * 90) - 45;
            const angle2 = ((index + 1) * 90) - 45;
            const radius = 42;
            const x1 = 50 + radius * Math.cos((angle1 * Math.PI) / 180);
            const y1 = 50 + radius * Math.sin((angle1 * Math.PI) / 180);
            const x2 = 50 + radius * Math.cos((angle2 * Math.PI) / 180);
            const y2 = 50 + radius * Math.sin((angle2 * Math.PI) / 180);
            
            return (
              <line
                key={index}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
      </div>
    </ScrollReveal>
  );
};
