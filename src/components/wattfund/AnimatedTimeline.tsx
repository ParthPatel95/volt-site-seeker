import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface TimelineStep {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  status?: 'completed' | 'active' | 'upcoming';
}

interface AnimatedTimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
}

export const AnimatedTimeline = ({ steps, orientation = 'horizontal' }: AnimatedTimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const statusColors = {
    completed: {
      bg: 'bg-watt-success',
      border: 'border-watt-success',
      text: 'text-watt-success',
      glow: 'shadow-watt-success/30',
    },
    active: {
      bg: 'bg-watt-bitcoin',
      border: 'border-watt-bitcoin',
      text: 'text-watt-bitcoin',
      glow: 'shadow-watt-bitcoin/30',
    },
    upcoming: {
      bg: 'bg-white/20',
      border: 'border-white/30',
      text: 'text-white/60',
      glow: '',
    },
  };

  if (orientation === 'vertical') {
    return (
      <div ref={ref} className="relative">
        {/* Vertical line */}
        <motion.div
          className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-watt-trust via-watt-bitcoin to-watt-success"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isInView ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformOrigin: 'top' }}
        />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const status = step.status || 'upcoming';
            const colors = statusColors[status];

            return (
              <motion.div
                key={index}
                className="relative flex gap-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  x: isInView ? 0 : -30,
                }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                {/* Icon circle */}
                <motion.div
                  className={`relative z-10 w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-lg ${colors.glow}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <step.icon className="w-5 h-5 text-white" />
                  
                  {status === 'active' && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-watt-bitcoin"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white">{step.title}</h4>
                    {step.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} text-white`}>
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div ref={ref} className="relative">
      {/* Horizontal line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-watt-trust via-watt-bitcoin to-watt-success"
          initial={{ width: 0 }}
          animate={{ width: isInView ? '100%' : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, index) => {
          const status = step.status || 'upcoming';
          const colors = statusColors[status];

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : 20,
              }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              {/* Icon circle */}
              <motion.div
                className={`relative z-10 w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-lg ${colors.glow} mb-4`}
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <step.icon className="w-5 h-5 text-white" />
                
                {status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-watt-bitcoin"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Step number */}
              <span className={`text-xs font-bold ${colors.text} mb-2`}>
                Step {index + 1}
              </span>

              {/* Content */}
              <h4 className="font-bold text-white text-sm mb-1">{step.title}</h4>
              <p className="text-white/60 text-xs leading-relaxed">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedTimeline;
