import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Volume2, Home, Factory, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundWave {
  id: number;
  scale: number;
  opacity: number;
}

interface AnimatedSoundPropagationProps {
  initialSourceDb?: number;
  initialDistance?: number;
}

const AnimatedSoundPropagation = ({ 
  initialSourceDb = 81.8, 
  initialDistance = 1700 
}: AnimatedSoundPropagationProps) => {
  const [sourceDb, setSourceDb] = useState(initialSourceDb);
  const [distance, setDistance] = useState(initialDistance);
  const [waves, setWaves] = useState<SoundWave[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  // Calculate attenuation
  const distanceAttenuation = 20 * Math.log10(distance);
  const atmosphericLoss = distance * 0.002;
  const resultDb = Math.max(0, sourceDb - distanceAttenuation - atmosphericLoss);

  // Determine zone color based on result
  const getZoneColor = () => {
    if (resultDb <= 30) return 'text-watt-success';
    if (resultDb <= 45) return 'text-watt-coinbase';
    if (resultDb <= 55) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getZoneLabel = () => {
    if (resultDb <= 30) return 'Inaudible';
    if (resultDb <= 45) return 'Below WHO Night Limit';
    if (resultDb <= 55) return 'Below WHO Day Limit';
    return 'May Exceed Limits';
  };

  // Animate sound waves
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setWaves(prev => {
        const newWaves = prev
          .map(w => ({ ...w, scale: w.scale + 0.3, opacity: w.opacity - 0.08 }))
          .filter(w => w.opacity > 0);
        
        if (newWaves.length < 5) {
          newWaves.push({ id: Date.now(), scale: 1, opacity: 1 });
        }
        
        return newWaves;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Calculate positions based on distance (normalized)
  const getHousePosition = () => {
    const normalized = Math.min(distance / 5000, 1);
    return 60 + normalized * 30; // 60% to 90%
  };

  return (
    <Card className="bg-gradient-to-br from-watt-navy to-watt-navy/95 border-none shadow-xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-watt-bitcoin/20 rounded-lg flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-watt-bitcoin" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sound Propagation Visualization</h3>
            <p className="text-sm text-white/60">Watch how sound attenuates with distance</p>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-watt-bitcoin/20 via-watt-coinbase/10 to-watt-success/10 rounded-xl overflow-hidden mb-6">
          {/* Animated Sound Waves */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <AnimatePresence>
              {waves.map(wave => (
                <motion.div
                  key={wave.id}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: wave.scale * 2, 
                    opacity: wave.opacity * 0.5 
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute border-2 border-watt-bitcoin rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: 40,
                    height: 40,
                    left: 20,
                    top: 0,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Facility Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="bg-watt-navy border-2 border-watt-bitcoin rounded-lg p-3 shadow-lg">
              <Factory className="h-8 w-8 text-watt-bitcoin" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <Badge className="bg-watt-bitcoin text-white text-xs">
                {sourceDb.toFixed(1)} dB
              </Badge>
            </div>
          </div>

          {/* Distance Markers */}
          {[
            { pos: 25, dist: '100m', db: Math.max(0, sourceDb - 40 - 0.2).toFixed(0) },
            { pos: 40, dist: '500m', db: Math.max(0, sourceDb - 54 - 1).toFixed(0) },
            { pos: 55, dist: '1km', db: Math.max(0, sourceDb - 60 - 2).toFixed(0) },
          ].map((marker, idx) => (
            <div
              key={idx}
              className="absolute top-full -translate-y-8 flex flex-col items-center"
              style={{ left: `${marker.pos}%` }}
            >
              <div className="w-px h-6 bg-white/30" />
              <span className="text-[10px] text-white/50 mt-1">{marker.dist}</span>
              <span className="text-[10px] font-mono text-watt-coinbase">{marker.db}dB</span>
            </div>
          ))}

          {/* House/Receptor */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 z-10"
            animate={{ left: `${getHousePosition()}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-2">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <Badge className={`${getZoneColor()} bg-black/50 text-xs`}>
                {resultDb.toFixed(1)} dB
              </Badge>
            </div>
          </motion.div>

          {/* Attenuation Arrow */}
          <div className="absolute bottom-2 left-1/4 right-1/4 flex items-center justify-center gap-2">
            <ArrowRight className="h-4 w-4 text-white/30" />
            <span className="text-xs text-white/50">Sound decreases with distance</span>
            <ArrowRight className="h-4 w-4 text-white/30" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <Label className="text-white/80 text-sm">Source Noise Level</Label>
            <Slider
              value={[sourceDb]}
              onValueChange={(v) => setSourceDb(v[0])}
              min={60}
              max={110}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>Hydro (67)</span>
              <span className="font-mono text-watt-bitcoin">{sourceDb.toFixed(1)} dB</span>
              <span>Air (95)</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white/80 text-sm">Distance to Receptor</Label>
            <Slider
              value={[distance]}
              onValueChange={(v) => setDistance(v[0])}
              min={100}
              max={5000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>100m</span>
              <span className="font-mono text-watt-coinbase">{(distance / 1000).toFixed(2)} km</span>
              <span>5km</span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 mb-1">Distance Loss</p>
            <p className="text-lg font-bold font-mono text-watt-bitcoin">
              -{distanceAttenuation.toFixed(1)} dB
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-xs text-white/60 mb-1">Atmospheric</p>
            <p className="text-lg font-bold font-mono text-watt-coinbase">
              -{atmosphericLoss.toFixed(1)} dB
            </p>
          </div>
          <div className={`bg-white/10 rounded-lg p-4 text-center border ${resultDb <= 45 ? 'border-watt-success/50' : 'border-yellow-500/50'}`}>
            <p className="text-xs text-white/60 mb-1">At Receptor</p>
            <p className={`text-lg font-bold font-mono ${getZoneColor()}`}>
              {resultDb.toFixed(1)} dB
            </p>
            <p className={`text-[10px] ${getZoneColor()}`}>{getZoneLabel()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimatedSoundPropagation;
