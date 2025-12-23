import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Activity, Server, Monitor, Bell, Database, ArrowRight } from "lucide-react";

interface FlowStage {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
  color: string;
}

const flowStages: FlowStage[] = [
  {
    id: "asic",
    icon: Cpu,
    title: "ASIC Miners",
    description: "Hardware sensors",
    details: [
      "Temperature sensors on each chip",
      "Fan RPM and speed monitoring",
      "Hashrate per hashboard",
      "Power consumption readings"
    ],
    color: "watt-bitcoin"
  },
  {
    id: "collect",
    icon: Activity,
    title: "Data Collection",
    description: "API polling & SNMP",
    details: [
      "Polling intervals: 30-60 seconds",
      "CGMiner/BMMiner API access",
      "SNMP for network equipment",
      "Environmental sensor APIs"
    ],
    color: "watt-blue"
  },
  {
    id: "aggregate",
    icon: Server,
    title: "Aggregation",
    description: "Central processing",
    details: [
      "Time-series database storage",
      "Real-time stream processing",
      "Metric normalization",
      "Anomaly detection algorithms"
    ],
    color: "watt-purple"
  },
  {
    id: "visualize",
    icon: Monitor,
    title: "Dashboards",
    description: "Visual monitoring",
    details: [
      "NOC wall displays",
      "Mobile-responsive views",
      "Drill-down capabilities",
      "Historical trend analysis"
    ],
    color: "watt-success"
  },
  {
    id: "alert",
    icon: Bell,
    title: "Alerting",
    description: "Notifications",
    details: [
      "Priority-based routing",
      "SMS/Email/Slack integration",
      "Escalation policies",
      "On-call schedule management"
    ],
    color: "red-500"
  }
];

export const AnimatedMonitoringFlow = () => {
  const [activeStage, setActiveStage] = useState<string | null>("asic");
  const [isAnimating, setIsAnimating] = useState(true);

  const activeStageData = flowStages.find(s => s.id === activeStage);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Monitoring Data Flow
        </h3>
        <p className="text-muted-foreground text-sm">
          Click any stage to learn more about the monitoring pipeline
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="relative mb-8">
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-watt-bitcoin/30 via-watt-blue/30 via-watt-purple/30 via-watt-success/30 to-red-500/30 -translate-y-1/2" />
        
        {/* Animated Data Particles */}
        {isAnimating && (
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-watt-bitcoin rounded-full"
                initial={{ left: "0%", opacity: 0 }}
                animate={{ 
                  left: "100%", 
                  opacity: [0, 1, 1, 1, 0],
                  backgroundColor: ["#F7931A", "#3B82F6", "#8B5CF6", "#22C55E", "#EF4444"]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ top: "-3px" }}
              />
            ))}
          </div>
        )}

        {/* Stage Icons */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 relative z-10">
          {flowStages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2 md:gap-4">
              <motion.button
                onClick={() => setActiveStage(stage.id)}
                className={`relative flex flex-col items-center p-3 md:p-4 rounded-xl transition-all ${
                  activeStage === stage.id 
                    ? `bg-${stage.color}/20 border-2 border-${stage.color}` 
                    : "bg-background border border-border hover:border-muted-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-${stage.color}/10`}>
                  <stage.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stage.color}`} />
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground mt-2 text-center">
                  {stage.title}
                </span>
                <span className="text-xs text-muted-foreground hidden md:block">
                  {stage.description}
                </span>
              </motion.button>
              
              {index < flowStages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage Details */}
      <AnimatePresence mode="wait">
        {activeStageData && (
          <motion.div
            key={activeStageData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`bg-${activeStageData.color}/5 border border-${activeStageData.color}/20 rounded-xl p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 bg-${activeStageData.color}/10 rounded-lg flex items-center justify-center`}>
                <activeStageData.icon className={`w-5 h-5 text-${activeStageData.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{activeStageData.title}</h4>
                <p className="text-sm text-muted-foreground">{activeStageData.description}</p>
              </div>
            </div>
            <ul className="grid md:grid-cols-2 gap-2">
              {activeStageData.details.map((detail, i) => (
                <motion.li
                  key={detail}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-${activeStageData.color}`} />
                  {detail}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Animation */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAnimating ? "Pause Animation" : "Resume Animation"}
        </button>
      </div>
    </div>
  );
};
