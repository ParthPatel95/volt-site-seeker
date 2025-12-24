import { motion } from "framer-motion";
import { MapPin, ShieldAlert, Zap, TrendingUp, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategicJourneyDiagramProps {
  currentTrack?: number;
  completedTracks?: number[];
  className?: string;
}

export const StrategicJourneyDiagram = ({ 
  currentTrack = 1, 
  completedTracks = [],
  className 
}: StrategicJourneyDiagramProps) => {
  const stages = [
    {
      track: 1,
      title: "Site Selection",
      subtitle: "Find the right location",
      icon: MapPin,
      color: "purple",
      gradient: "from-purple-500 to-violet-600",
      bgGlow: "bg-purple-500/20",
      keyActions: ["Power analysis", "Market research", "Regulatory review"]
    },
    {
      track: 2,
      title: "Risk Assessment",
      subtitle: "Evaluate all factors",
      icon: ShieldAlert,
      color: "orange",
      gradient: "from-orange-500 to-amber-600",
      bgGlow: "bg-orange-500/20",
      keyActions: ["Due diligence", "Risk scoring", "Break-even calc"]
    },
    {
      track: 3,
      title: "Execution",
      subtitle: "Build & operate",
      icon: Zap,
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
      bgGlow: "bg-blue-500/20",
      keyActions: ["Development", "Insurance", "Crisis planning"]
    },
    {
      track: 4,
      title: "Scaling",
      subtitle: "Grow operations",
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      bgGlow: "bg-green-500/20",
      keyActions: ["Capacity plan", "Multi-site", "Portfolio mgmt"]
    },
    {
      track: 5,
      title: "Strategic Growth",
      subtitle: "Capital & M&A",
      icon: Award,
      color: "pink",
      gradient: "from-pink-500 to-rose-600",
      bgGlow: "bg-pink-500/20",
      keyActions: ["Fundraising", "Partnerships", "Acquisitions"]
    }
  ];

  return (
    <div className={cn("py-8", className)}>
      {/* Desktop Horizontal Journey */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-orange-500 via-blue-500 via-green-500 to-pink-500 opacity-30" />
          
          {/* Progress Line */}
          <motion.div
            className="absolute top-16 left-0 h-1 bg-gradient-to-r from-purple-500 via-orange-500 via-blue-500 via-green-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((completedTracks.length) / stages.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          <div className="grid grid-cols-5 gap-4">
            {stages.map((stage, index) => {
              const isCompleted = completedTracks.includes(stage.track);
              const isCurrent = stage.track === currentTrack;
              const isPast = stage.track < currentTrack;
              
              return (
                <motion.div
                  key={stage.track}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Stage Circle */}
                  <div className={cn(
                    "relative mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                    isCurrent && stage.bgGlow,
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}>
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                      isCompleted 
                        ? "bg-green-500" 
                        : isCurrent 
                          ? `bg-gradient-to-r ${stage.gradient}`
                          : "bg-muted"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      ) : (
                        <stage.icon className={cn(
                          "w-10 h-10",
                          isCurrent ? "text-white" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                    
                    {/* Pulse Animation for Current */}
                    {isCurrent && (
                      <div className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-20",
                        `bg-gradient-to-r ${stage.gradient}`
                      )} />
                    )}
                  </div>
                  
                  {/* Arrow to Next */}
                  {index < stages.length - 1 && (
                    <div className="absolute top-16 -right-2 z-10 hidden xl:block">
                      <ArrowRight className={cn(
                        "w-5 h-5 transition-colors",
                        isPast ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  )}
                  
                  {/* Stage Info */}
                  <div className="text-center mt-4">
                    <div className={cn(
                      "text-xs font-medium mb-1",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                      Track {stage.track}
                    </div>
                    <h4 className={cn(
                      "font-bold mb-1",
                      isCurrent ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}>
                      {stage.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">{stage.subtitle}</p>
                    
                    {/* Key Actions */}
                    <div className="space-y-1">
                      {stage.keyActions.map((action, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "text-xs py-0.5 px-2 rounded-full inline-block mx-0.5",
                            isCurrent 
                              ? `bg-${stage.color}-500/10 text-${stage.color}-600`
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Journey */}
      <div className="lg:hidden">
        <div className="relative pl-8">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-orange-500 via-blue-500 via-green-500 to-pink-500 opacity-30" />
          
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const isCompleted = completedTracks.includes(stage.track);
              const isCurrent = stage.track === currentTrack;
              
              return (
                <motion.div
                  key={stage.track}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Circle on Timeline */}
                  <div className={cn(
                    "absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center",
                    isCompleted 
                      ? "bg-green-500" 
                      : isCurrent 
                        ? `bg-gradient-to-r ${stage.gradient}`
                        : "bg-muted border-2 border-border"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className={cn(
                        "text-xs font-bold",
                        isCurrent ? "text-white" : "text-muted-foreground"
                      )}>
                        {stage.track}
                      </span>
                    )}
                  </div>
                  
                  {/* Content Card */}
                  <div className={cn(
                    "bg-card border rounded-xl p-4 transition-all",
                    isCurrent ? "border-primary shadow-lg" : "border-border"
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isCompleted ? "bg-green-500/10" : `bg-${stage.color}-500/10`
                      )}>
                        <stage.icon className={cn(
                          "w-5 h-5",
                          isCompleted ? "text-green-500" : `text-${stage.color}-500`
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{stage.title}</h4>
                        <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
                      </div>
                    </div>
                    
                    {/* Key Actions */}
                    <div className="flex flex-wrap gap-1">
                      {stage.keyActions.map((action, i) => (
                        <span 
                          key={i}
                          className="text-xs py-0.5 px-2 rounded-full bg-muted text-muted-foreground"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
