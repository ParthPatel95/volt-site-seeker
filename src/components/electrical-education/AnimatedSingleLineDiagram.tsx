import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Info, X } from 'lucide-react';

interface PowerStage {
  id: string;
  label: string;
  voltage: string;
  description: string;
  color: string;
  details: string[];
}

const powerStages: PowerStage[] = [
  {
    id: 'grid',
    label: 'Utility Grid',
    voltage: '138kV - 500kV',
    description: 'High voltage transmission from power plants',
    color: 'text-red-500',
    details: [
      'Transmission lines from power plants',
      'Highest efficiency for long distances',
      'Managed by utility companies',
    ],
  },
  {
    id: 'substation',
    label: 'Substation',
    voltage: '25kV - 69kV',
    description: 'First step-down transformation',
    color: 'text-orange-500',
    details: [
      'Large power transformers',
      'Protection equipment (breakers, fuses)',
      'Metering and monitoring',
    ],
  },
  {
    id: 'facility-hv',
    label: 'Facility MV',
    voltage: '12.47kV - 25kV',
    description: 'Medium voltage distribution within facility',
    color: 'text-yellow-500',
    details: [
      'Metal-clad switchgear',
      'Protective relays',
      'Distribution to multiple transformers',
    ],
  },
  {
    id: 'transformer',
    label: 'Unit Transformer',
    voltage: '480V - 600V',
    description: 'Step-down for building distribution',
    color: 'text-green-500',
    details: [
      'Oil or dry-type transformers',
      'Typically 1-3 MVA capacity',
      'Located near load centers',
    ],
  },
  {
    id: 'switchboard',
    label: 'Switchboard',
    voltage: '480V - 600V',
    description: 'Main distribution panel',
    color: 'text-teal-500',
    details: [
      'Main breaker protection',
      'Feeder breakers to PDUs',
      'Power monitoring systems',
    ],
  },
  {
    id: 'pdu',
    label: 'PDU',
    voltage: '208V - 240V',
    description: 'Power Distribution Unit',
    color: 'text-blue-500',
    details: [
      'Final step-down transformer',
      'Branch circuit breakers',
      'Per-circuit monitoring',
    ],
  },
  {
    id: 'miner',
    label: 'Miner PSU',
    voltage: '12V DC',
    description: 'ASIC power supply conversion',
    color: 'text-watt-bitcoin',
    details: [
      'AC to DC rectification',
      'Voltage regulation',
      'Powers hash boards directly',
    ],
  },
];

export const AnimatedSingleLineDiagram: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [animatingParticle, setAnimatingParticle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingParticle((prev) => (prev + 1) % 7);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const selectedStage = powerStages.find((s) => s.id === activeStage);

  return (
    <div className="relative bg-gradient-to-br from-watt-navy to-watt-navy/95 rounded-2xl p-6 md:p-8 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Title */}
      <div className="relative mb-6 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          Power Flow: Grid to ASIC
        </h3>
        <p className="text-white/60 text-sm">
          Click any stage to learn more about the power conversion process
        </p>
      </div>

      {/* Main diagram */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-watt-bitcoin opacity-30 transform -translate-y-1/2 hidden md:block" />
        
        {/* Animated particles */}
        <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 hidden md:block overflow-hidden">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 rounded-full bg-watt-bitcoin"
              style={{
                left: `${(index / 6) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: animatingParticle === index ? [1, 1.5, 1] : 1,
                opacity: animatingParticle === index ? [0.5, 1, 0.5] : 0.3,
              }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </div>

        {/* Stages */}
        <div className="relative grid grid-cols-2 md:grid-cols-7 gap-4">
          {powerStages.map((stage, index) => (
            <motion.button
              key={stage.id}
              onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                activeStage === stage.id
                  ? 'bg-white/20 ring-2 ring-watt-bitcoin'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Stage number */}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-watt-navy border-2 border-white/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>

              {/* Icon circle */}
              <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 ${stage.color}`}>
                <Zap className="w-6 h-6" />
              </div>

              {/* Label */}
              <span className="text-xs font-medium text-white text-center leading-tight">
                {stage.label}
              </span>
              
              {/* Voltage */}
              <span className={`text-[10px] font-mono ${stage.color} mt-1`}>
                {stage.voltage}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <button
              onClick={() => setActiveStage(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-white/10 ${selectedStage.color}`}>
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">
                  {selectedStage.label} ({selectedStage.voltage})
                </h4>
                <p className="text-sm text-white/70 mb-3">{selectedStage.description}</p>
                <ul className="space-y-1">
                  {selectedStage.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voltage reduction indicator */}
      <div className="relative mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>High Voltage (Transmission)</span>
          <div className="flex-1 mx-4 h-px bg-gradient-to-r from-red-500/50 via-yellow-500/50 to-watt-bitcoin/50" />
          <span>Low Voltage (Utilization)</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-red-400 font-mono text-sm font-bold">500,000V</span>
          <span className="text-watt-bitcoin font-mono text-lg font-bold">→ 12V DC</span>
        </div>
        <p className="text-center text-white/40 text-xs mt-2">
          ~41,666x voltage reduction through 6-7 transformation stages
        </p>
      </div>
    </div>
  );
};

export default AnimatedSingleLineDiagram;
