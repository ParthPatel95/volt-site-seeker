import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Wrench, Thermometer, CheckCircle2 } from "lucide-react";

interface MaintenancePhase {
  id: string;
  label: string;
  frequency: string;
  duration: string;
  tasks: string[];
  color: string;
  angle: number;
}

const phases: MaintenancePhase[] = [
  {
    id: "daily",
    label: "Daily",
    frequency: "Every day",
    duration: "30-60 min",
    tasks: [
      "Visual inspection of all rows",
      "Check monitoring dashboards",
      "Review overnight alerts",
      "Verify cooling operation"
    ],
    color: "watt-success",
    angle: 0
  },
  {
    id: "weekly",
    label: "Weekly",
    frequency: "Every week",
    duration: "2-4 hours",
    tasks: [
      "Air filter inspection",
      "Check electrical connections",
      "Test backup systems",
      "Review performance trends"
    ],
    color: "watt-blue",
    angle: 90
  },
  {
    id: "monthly",
    label: "Monthly",
    frequency: "Every month",
    duration: "4-8 hours",
    tasks: [
      "Deep clean equipment",
      "Thermal imaging inspection",
      "Calibrate sensors",
      "Firmware updates"
    ],
    color: "watt-purple",
    angle: 180
  },
  {
    id: "quarterly",
    label: "Quarterly",
    frequency: "Every 3 months",
    duration: "1-2 days",
    tasks: [
      "Full electrical inspection",
      "Cooling system maintenance",
      "Replace consumables",
      "Performance benchmarking"
    ],
    color: "watt-bitcoin",
    angle: 270
  }
];

export const MaintenanceCycleWheel = () => {
  const [activePhase, setActivePhase] = useState<string>("daily");
  const [isSpinning, setIsSpinning] = useState(false);
  
  const activePhaseData = phases.find(p => p.id === activePhase);
  const wheelSize = 280;
  const centerSize = 100;
  const buttonRadius = (wheelSize - centerSize) / 2 - 20;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Preventive Maintenance Cycle
        </h3>
        <p className="text-muted-foreground text-sm">
          Click any phase to view detailed maintenance tasks
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Wheel */}
        <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          
          {/* Gradient Segments */}
          <svg className="absolute inset-0" viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            <defs>
              {phases.map((phase, i) => (
                <linearGradient key={phase.id} id={`gradient-${phase.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`text-${phase.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.3 }} />
                  <stop offset="100%" className={`text-${phase.color}`} style={{ stopColor: 'currentColor', stopOpacity: 0.1 }} />
                </linearGradient>
              ))}
            </defs>
            {phases.map((phase, i) => {
              const startAngle = i * 90 - 45;
              const endAngle = startAngle + 90;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const radius = wheelSize / 2 - 2;
              const innerRadius = centerSize / 2;
              const cx = wheelSize / 2;
              const cy = wheelSize / 2;
              
              const x1 = cx + radius * Math.cos(startRad);
              const y1 = cy + radius * Math.sin(startRad);
              const x2 = cx + radius * Math.cos(endRad);
              const y2 = cy + radius * Math.sin(endRad);
              const x3 = cx + innerRadius * Math.cos(endRad);
              const y3 = cy + innerRadius * Math.sin(endRad);
              const x4 = cx + innerRadius * Math.cos(startRad);
              const y4 = cy + innerRadius * Math.sin(startRad);
              
              return (
                <path
                  key={phase.id}
                  d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                  fill={`url(#gradient-${phase.id})`}
                  className={`transition-opacity ${activePhase === phase.id ? 'opacity-100' : 'opacity-50'}`}
                />
              );
            })}
          </svg>

          {/* Center Circle */}
          <motion.div
            className="absolute bg-background border-4 border-border rounded-full flex items-center justify-center shadow-lg"
            style={{
              width: centerSize,
              height: centerSize,
              left: (wheelSize - centerSize) / 2,
              top: (wheelSize - centerSize) / 2
            }}
            animate={{ rotate: isSpinning ? 360 : 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <div className="text-center">
              <Calendar className="w-8 h-8 text-watt-bitcoin mx-auto mb-1" />
              <span className="text-xs font-medium text-muted-foreground">Cycle</span>
            </div>
          </motion.div>

          {/* Phase Buttons */}
          {phases.map((phase) => {
            const angleRad = (phase.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * buttonRadius;
            const y = Math.sin(angleRad) * buttonRadius;
            
            return (
              <motion.button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`absolute rounded-full flex items-center justify-center transition-all ${
                  activePhase === phase.id 
                    ? `bg-${phase.color} text-white shadow-lg` 
                    : `bg-background border-2 border-${phase.color}/50 text-${phase.color} hover:border-${phase.color}`
                }`}
                style={{
                  width: 60,
                  height: 60,
                  left: wheelSize / 2 + x - 30,
                  top: wheelSize / 2 + y - 30
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <span className="text-xs font-bold block">{phase.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Phase Details */}
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {activePhaseData && (
              <motion.div
                key={activePhaseData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`bg-${activePhaseData.color}/5 border border-${activePhaseData.color}/20 rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-xl font-bold text-${activePhaseData.color}`}>
                    {activePhaseData.label} Maintenance
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {activePhaseData.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activePhaseData.duration}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {activePhaseData.tasks.map((task, i) => (
                    <motion.div
                      key={task}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 bg-background/50 rounded-lg p-3"
                    >
                      <CheckCircle2 className={`w-5 h-5 text-${activePhaseData.color} flex-shrink-0`} />
                      <span className="text-foreground">{task}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="w-4 h-4" />
                    <span>Consistent maintenance reduces unplanned downtime by up to 70%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
