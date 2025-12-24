import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";

const risks = [
  { name: "BTC Price Crash", impact: 5, likelihood: 4, category: "market" },
  { name: "Power Outage", impact: 4, likelihood: 3, category: "operational" },
  { name: "Equipment Failure", impact: 3, likelihood: 4, category: "operational" },
  { name: "Regulatory Ban", impact: 5, likelihood: 2, category: "regulatory" },
  { name: "Difficulty Spike", impact: 3, likelihood: 5, category: "market" },
  { name: "Liquidity Crisis", impact: 5, likelihood: 3, category: "financial" },
  { name: "Cyber Attack", impact: 4, likelihood: 2, category: "operational" },
  { name: "Permit Revocation", impact: 4, likelihood: 2, category: "regulatory" },
  { name: "Halving Event", impact: 4, likelihood: 5, category: "market" },
  { name: "Counterparty Default", impact: 3, likelihood: 2, category: "financial" },
];

const getCellColor = (impact: number, likelihood: number) => {
  const score = impact * likelihood;
  if (score >= 20) return "bg-red-500";
  if (score >= 12) return "bg-orange-500";
  if (score >= 6) return "bg-yellow-500";
  return "bg-green-500";
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "market": return "text-red-500 border-red-500/50";
    case "operational": return "text-orange-500 border-orange-500/50";
    case "regulatory": return "text-yellow-500 border-yellow-500/50";
    case "financial": return "text-green-500 border-green-500/50";
    default: return "text-muted-foreground border-border";
  }
};

export const VisualRiskMatrix = () => {
  const [hoveredCell, setHoveredCell] = useState<{ impact: number; likelihood: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "market", label: "Market", color: "bg-red-500" },
    { id: "operational", label: "Operational", color: "bg-orange-500" },
    { id: "regulatory", label: "Regulatory", color: "bg-yellow-500" },
    { id: "financial", label: "Financial", color: "bg-green-500" },
  ];

  const filteredRisks = selectedCategory 
    ? risks.filter(r => r.category === selectedCategory)
    : risks;

  const getRisksInCell = (impact: number, likelihood: number) => {
    return filteredRisks.filter(r => r.impact === impact && r.likelihood === likelihood);
  };

  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-2xl p-6 my-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Interactive Risk Matrix</h3>
            <p className="text-sm text-muted-foreground">Hover over cells to see risks, click categories to filter</p>
          </div>
          
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === null 
                  ? 'bg-foreground text-background' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id 
                    ? `${cat.color} text-white` 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Y-axis label */}
          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">
              ← Lower Impact | Higher Impact →
            </span>
          </div>

          <div className="flex-1">
            {/* Matrix grid */}
            <div className="grid grid-cols-6 gap-1">
              {/* Header row */}
              <div className="h-8" /> {/* Empty corner */}
              {[1, 2, 3, 4, 5].map((likelihood) => (
                <div key={likelihood} className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium">
                  L{likelihood}
                </div>
              ))}

              {/* Data rows */}
              {[5, 4, 3, 2, 1].map((impact) => (
                <>
                  <div key={`impact-${impact}`} className="h-16 flex items-center justify-center text-xs text-muted-foreground font-medium">
                    I{impact}
                  </div>
                  {[1, 2, 3, 4, 5].map((likelihood) => {
                    const cellRisks = getRisksInCell(impact, likelihood);
                    const isHovered = hoveredCell?.impact === impact && hoveredCell?.likelihood === likelihood;
                    
                    return (
                      <motion.div
                        key={`${impact}-${likelihood}`}
                        className={`h-16 rounded-lg ${getCellColor(impact, likelihood)} cursor-pointer relative overflow-hidden`}
                        style={{ opacity: cellRisks.length > 0 ? 1 : 0.3 }}
                        onHoverStart={() => setHoveredCell({ impact, likelihood })}
                        onHoverEnd={() => setHoveredCell(null)}
                        whileHover={{ scale: 1.05, zIndex: 10 }}
                      >
                        {/* Risk count badge */}
                        {cellRisks.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {cellRisks.length}
                            </span>
                          </div>
                        )}

                        {/* Tooltip */}
                        <AnimatePresence>
                          {isHovered && cellRisks.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48"
                            >
                              <div className="bg-card border border-border rounded-lg shadow-xl p-3">
                                <div className="text-xs text-muted-foreground mb-2">
                                  Impact: {impact} | Likelihood: {likelihood}
                                </div>
                                <div className="space-y-1">
                                  {cellRisks.map((risk, i) => (
                                    <div 
                                      key={i}
                                      className={`text-xs font-medium px-2 py-1 rounded border ${getCategoryColor(risk.category)}`}
                                    >
                                      {risk.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </>
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground">
                ← Lower Likelihood | Higher Likelihood →
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-muted-foreground">Low (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-muted-foreground">Medium (6-11)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-muted-foreground">High (12-19)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-muted-foreground">Critical (20-25)</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
