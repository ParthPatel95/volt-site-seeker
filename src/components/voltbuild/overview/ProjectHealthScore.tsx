import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ProjectHealthScoreProps {
  score: number;
  onTrackCount: number;
  atRiskCount: number;
  delayedCount: number;
  insight?: string;
}

function HealthGauge({ score }: { score: number }) {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted/30"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          strokeWidth={strokeWidth}
          className={getScoreColor(score)}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <span className="text-3xl font-bold text-foreground">{Math.round(score)}</span>
          <span className="text-lg text-muted-foreground">/100</span>
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1">{getScoreLabel(score)}</p>
      </div>
    </div>
  );
}

export function ProjectHealthScore({
  score,
  onTrackCount,
  atRiskCount,
  delayedCount,
  insight
}: ProjectHealthScoreProps) {
  const statusItems = [
    { 
      icon: CheckCircle2, 
      label: 'On Track', 
      count: onTrackCount, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      icon: AlertTriangle, 
      label: 'At Risk', 
      count: atRiskCount, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    { 
      icon: Clock, 
      label: 'Delayed', 
      count: delayedCount, 
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Project Health</h3>
      </div>
      
      <div className="flex flex-col items-center">
        <HealthGauge score={score} />
        
        <div className="grid grid-cols-3 gap-2 w-full mt-6">
          {statusItems.map((item) => (
            <div 
              key={item.label}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg",
                item.bg
              )}
            >
              <item.icon className={cn("w-4 h-4 mb-1", item.color)} />
              <span className="text-lg font-bold text-foreground">{item.count}</span>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        
        {insight && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground text-center mt-4 p-3 bg-muted/30 rounded-lg"
          >
            {insight}
          </motion.p>
        )}
      </div>
    </Card>
  );
}
