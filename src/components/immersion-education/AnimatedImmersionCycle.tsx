import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const stages = [
  {
    id: 'heat-generation',
    name: 'Heat Generation',
    description: 'ASIC chips consume 3-5kW of power, converting nearly all electricity to heat at the silicon die.',
    tempRange: '85-95°C',
    icon: '🔥',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'heat-transfer-fluid',
    name: 'Heat to Fluid',
    description: 'Dielectric fluid in direct contact with chips absorbs heat through forced convection (300-1000 W/m²·K).',
    tempRange: '45-55°C',
    icon: '💧',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'circulation',
    name: 'Pump Circulation',
    description: 'Mag-drive pumps circulate heated fluid at 5-10 GPM per kW, maintaining laminar flow across components.',
    tempRange: '50-60°C',
    icon: '🔄',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'heat-exchange',
    name: 'Heat Exchanger',
    description: 'Plate or shell-and-tube exchanger transfers heat from dielectric fluid to water or glycol loop.',
    tempRange: '35-45°C',
    icon: '🔁',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'dry-cooler',
    name: 'Dry Cooler',
    description: 'External radiators reject heat to ambient air. Fans modulate based on fluid return temperature.',
    tempRange: '25-35°C',
    icon: '🌬️',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'return-flow',
    name: 'Cool Return',
    description: 'Cooled fluid returns to tank, completing the cycle. Temperature differential drives efficiency.',
    tempRange: '40-50°C',
    icon: '↩️',
    color: 'from-indigo-500 to-cyan-500'
  }
];

const AnimatedImmersionCycle = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const currentStage = stages[activeStage];

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-foreground">Immersion Cooling Cycle</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
            className="gap-2"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Pause' : 'Play'}
          </Button>
        </div>

        {/* Visual Cycle */}
        <div className="relative mb-8">
          {/* Tank Visualization */}
          <div className="relative h-64 bg-gradient-to-b from-zinc-900/50 to-zinc-950/80 rounded-xl border border-zinc-700/50 overflow-hidden">
            {/* Tank fluid */}
            <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-cyan-600/30 to-cyan-400/10 rounded-b-xl">
              {/* Flow animation */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse"
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${30 + Math.sin(i) * 20}%`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ASICs */}
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex gap-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-16 h-10 rounded border-2 flex items-center justify-center text-xs font-mono transition-all duration-500 ${
                    activeStage === 0
                      ? 'bg-red-500/30 border-red-500 text-red-400'
                      : activeStage === 1
                      ? 'bg-orange-500/30 border-orange-500 text-orange-400'
                      : 'bg-zinc-700/50 border-zinc-600 text-zinc-400'
                  }`}
                >
                  ASIC
                </div>
              ))}
            </div>

            {/* Heat exchanger */}
            <div className={`absolute top-4 right-4 w-12 h-20 rounded border-2 flex flex-col items-center justify-center transition-all duration-500 ${
              activeStage === 3
                ? 'bg-cyan-500/30 border-cyan-500'
                : 'bg-zinc-800/50 border-zinc-600'
            }`}>
              <span className="text-[8px] text-muted-foreground">HEX</span>
              <div className="flex gap-0.5 mt-1">
                <div className={`w-1 h-6 rounded-full transition-colors ${activeStage === 3 ? 'bg-orange-400' : 'bg-zinc-600'}`} />
                <div className={`w-1 h-6 rounded-full transition-colors ${activeStage === 3 ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
              </div>
            </div>

            {/* Pump */}
            <div className={`absolute bottom-4 right-4 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              activeStage === 2
                ? 'bg-amber-500/30 border-amber-500 animate-spin'
                : 'bg-zinc-800/50 border-zinc-600'
            }`} style={{ animationDuration: '2s' }}>
              <span className="text-xs">P</span>
            </div>

            {/* Dry cooler */}
            <div className={`absolute top-4 left-4 w-16 h-12 rounded border-2 flex flex-col items-center justify-center transition-all duration-500 ${
              activeStage === 4
                ? 'bg-blue-500/30 border-blue-500'
                : 'bg-zinc-800/50 border-zinc-600'
            }`}>
              <span className="text-[8px] text-muted-foreground">Dry Cooler</span>
              <span className={`text-lg transition-transform ${activeStage === 4 ? 'animate-pulse' : ''}`}>🌬️</span>
            </div>

            {/* Temperature indicator */}
            <div className="absolute bottom-4 left-4 bg-zinc-900/80 rounded-lg px-3 py-2 border border-zinc-700">
              <div className="text-xs text-muted-foreground mb-1">Current Stage Temp</div>
              <div className={`font-mono font-bold bg-gradient-to-r ${currentStage.color} bg-clip-text text-transparent`}>
                {currentStage.tempRange}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between mb-4">
          {stages.map((stage, index) => (
            <button
              key={stage.id}
              onClick={() => {
                setActiveStage(index);
                setIsAnimating(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                activeStage === index
                  ? 'bg-cyan-500/10 border border-cyan-500/30'
                  : 'hover:bg-muted/50'
              }`}
            >
              <span className="text-xl">{stage.icon}</span>
              <span className={`text-[10px] font-medium ${
                activeStage === index ? 'text-cyan-500' : 'text-muted-foreground'
              }`}>
                {index + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Current Stage Description */}
        <div className={`p-4 rounded-xl bg-gradient-to-r ${currentStage.color} bg-opacity-10 border border-current/20`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentStage.icon}</span>
            <div>
              <h5 className="font-semibold text-foreground">{currentStage.name}</h5>
              <span className="text-xs text-muted-foreground">Stage {activeStage + 1} of {stages.length}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{currentStage.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedImmersionCycle;
