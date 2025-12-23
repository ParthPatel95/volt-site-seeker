import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Droplets, ThermometerSun, Wind, Play, Pause } from 'lucide-react';

const stages = [
  {
    id: 'miner',
    name: 'Mining Hardware',
    description: 'ASIC miners generate ~3.4kW of heat per TH/s. Coolant absorbs this heat.',
    temp: '65-70°C',
    icon: Cpu,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'exchange',
    name: 'Heat Exchanger',
    description: 'Plate heat exchangers transfer heat from miner coolant to external water loop.',
    temp: '55-60°C',
    icon: ThermometerSun,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'tower',
    name: 'Cooling Tower',
    description: 'Heat is rejected to atmosphere via evaporative or dry cooling.',
    temp: '25-35°C',
    icon: Wind,
    color: 'from-yellow-500 to-green-500'
  },
  {
    id: 'return',
    name: 'Cooled Return',
    description: 'Cooled water returns to absorb more heat from miners.',
    temp: '20-25°C',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-500'
  }
];

const AnimatedCoolingCycle = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeStage, setActiveStage] = useState(0);

  React.useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % stages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-watt-navy to-blue-900 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Hydro-Cooling Cycle Animation</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnimating(!isAnimating)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnimating ? 'Pause' : 'Play'}
            </Button>
          </div>
          
          {/* Cycle visualization */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = activeStage === index;
                
                return (
                  <div
                    key={stage.id}
                    onClick={() => setActiveStage(index)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-500 ${
                      isActive 
                        ? `bg-gradient-to-br ${stage.color} scale-105 shadow-lg` 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {/* Flow indicator */}
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white animate-ping" />
                    )}
                    
                    <div className="flex flex-col items-center text-center">
                      <Icon className={`w-8 h-8 mb-2 ${isActive ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-semibold mb-1">{stage.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/30' : 'bg-white/10'
                      }`}>
                        {stage.temp}
                      </span>
                    </div>
                    
                    {/* Step number */}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                      isActive ? 'bg-white text-gray-900' : 'bg-white/20'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Flow arrows */}
            <div className="hidden md:flex justify-center gap-4 mb-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-0.5 ${activeStage === i ? 'bg-white' : 'bg-white/30'}`} />
                  <div className={`w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent ${
                    activeStage === i ? 'border-l-white' : 'border-l-white/30'
                  }`} style={{ borderLeftWidth: '6px' }} />
                </div>
              ))}
              {/* Return arrow */}
              <div className="flex items-center">
                <div className={`w-8 h-0.5 ${activeStage === 3 ? 'bg-cyan-400' : 'bg-white/30'}`} />
                <span className="text-xs text-white/50 ml-2">↻ cycle</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active stage description */}
        <div className="p-6 bg-white">
          <div className={`p-4 rounded-lg bg-gradient-to-r ${stages[activeStage].color} bg-opacity-10`}>
            <h4 className="font-semibold text-foreground mb-2">
              Stage {activeStage + 1}: {stages[activeStage].name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {stages[activeStage].description}
            </p>
          </div>
          
          {/* Temperature gradient */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Cold (20°C)</span>
              <span>Temperature Gradient</span>
              <span>Hot (70°C)</span>
            </div>
            <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 relative">
              <div 
                className="absolute w-4 h-4 -top-0.5 bg-white border-2 border-gray-300 rounded-full shadow transition-all duration-500"
                style={{ 
                  left: `${((activeStage === 0 ? 90 : activeStage === 1 ? 70 : activeStage === 2 ? 30 : 10) / 100) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedCoolingCycle;
