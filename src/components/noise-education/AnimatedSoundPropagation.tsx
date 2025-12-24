import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Volume2, Home, Factory, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundWave {
  id: number;
  progress: number; // 0 to 1 representing travel progress
  startTime: number;
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
  const [receptorPulse, setReceptorPulse] = useState(0);

  // Calculate attenuation using inverse square law
  const distanceAttenuation = 20 * Math.log10(distance);
  const atmosphericLoss = distance * 0.002;
  const resultDb = Math.max(0, sourceDb - distanceAttenuation - atmosphericLoss);

  // Calculate wave physics parameters
  const waveParams = useMemo(() => {
    // Normalize distance for wave count (more waves for longer distances)
    const normalizedDistance = Math.min(distance / 5000, 1);
    const maxWaves = Math.floor(3 + normalizedDistance * 5); // 3-8 waves based on distance
    
    // Wave spawn interval based on distance (faster spawn for shorter distances)
    const spawnInterval = 300 + normalizedDistance * 200; // 300-500ms
    
    // How fast waves travel (normalized speed)
    const waveSpeed = 0.015 + (1 - normalizedDistance) * 0.01; // Faster for closer
    
    // Initial opacity based on source dB (louder = more opaque)
    const initialOpacity = Math.min(1, (sourceDb - 60) / 40); // 0.0 at 60dB, 1.0 at 100dB
    
    return { maxWaves, spawnInterval, waveSpeed, initialOpacity };
  }, [distance, sourceDb]);

  // Calculate wave opacity based on progress using inverse square law
  const getWaveOpacity = (progress: number) => {
    // Inverse square law: intensity ∝ 1/r²
    // At progress 0 (source), full opacity; at progress 1 (receptor), much less
    const distanceFactor = 1 + progress * (distance / 100); // Simulated distance factor
    const inverseSquareFade = 1 / (distanceFactor * distanceFactor);
    
    // Also factor in the source dB level
    const sourceIntensity = waveParams.initialOpacity;
    
    // Combine factors - waves fade faster at greater distances
    const opacity = sourceIntensity * inverseSquareFade * (1 - progress * 0.3);
    
    return Math.max(0, Math.min(1, opacity));
  };

  // Get wave color based on progress (orange → teal → green)
  const getWaveColor = (progress: number): string => {
    if (progress < 0.4) {
      // Orange to teal transition
      return `rgb(${Math.round(247 - progress * 200)}, ${Math.round(147 + progress * 150)}, ${Math.round(30 + progress * 150)})`;
    } else {
      // Teal to green transition
      const p = (progress - 0.4) / 0.6;
      return `rgb(${Math.round(127 - p * 100)}, ${Math.round(207 + p * 48)}, ${Math.round(90 + p * 37)})`;
    }
  };

  // Animate sound waves
  useEffect(() => {
    let animationFrame: number;
    let lastSpawnTime = 0;
    
    const animate = (currentTime: number) => {
      // Spawn new waves at interval
      if (currentTime - lastSpawnTime > waveParams.spawnInterval) {
        setWaves(prev => {
          const activeWaves = prev.filter(w => w.progress < 1.1);
          if (activeWaves.length < waveParams.maxWaves) {
            return [...activeWaves, { 
              id: currentTime, 
              progress: 0,
              startTime: currentTime 
            }];
          }
          return activeWaves;
        });
        lastSpawnTime = currentTime;
      }
      
      // Update wave progress
      setWaves(prev => 
        prev
          .map(w => ({ 
            ...w, 
            progress: w.progress + waveParams.waveSpeed 
          }))
          .filter(w => w.progress < 1.2) // Remove waves past receptor
      );
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [waveParams]);

  // Trigger receptor pulse when wave reaches receptor
  useEffect(() => {
    const hasWaveAtReceptor = waves.some(w => w.progress >= 0.95 && w.progress < 1.05);
    if (hasWaveAtReceptor && resultDb > 5) {
      // Pulse intensity proportional to received dB
      const pulseIntensity = Math.min(1, resultDb / 55);
      setReceptorPulse(pulseIntensity);
      const timeout = setTimeout(() => setReceptorPulse(0), 200);
      return () => clearTimeout(timeout);
    }
  }, [waves, resultDb]);

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

  // Calculate house position (normalized)
  const getHousePosition = () => {
    const normalized = Math.min(distance / 5000, 1);
    return 60 + normalized * 30; // 60% to 90%
  };

  // Calculate wave size based on progress
  const getWaveSize = (progress: number) => {
    const baseSize = 40;
    const maxScale = 2 + (distance / 1000); // Larger max scale for greater distances
    return baseSize + progress * maxScale * 60;
  };

  // Calculate wave position (progress to visual position)
  const getWavePosition = (progress: number) => {
    const startPos = 8; // Percentage from left (source position)
    const endPos = getHousePosition(); // Receptor position
    return startPos + progress * (endPos - startPos);
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
            <p className="text-sm text-white/60">Watch how sound attenuates with distance (inverse square law)</p>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-watt-bitcoin/20 via-watt-coinbase/10 to-watt-success/10 rounded-xl overflow-hidden mb-6">
          {/* Sound Field Gradient Trail */}
          <div 
            className="absolute inset-y-0 left-0 pointer-events-none"
            style={{
              width: `${getHousePosition()}%`,
              background: `linear-gradient(to right, 
                rgba(247, 147, 30, ${waveParams.initialOpacity * 0.3}) 0%, 
                rgba(0, 212, 170, ${waveParams.initialOpacity * 0.15}) 50%, 
                rgba(39, 174, 96, ${Math.min(resultDb / 100, 0.1)}) 100%
              )`,
            }}
          />

          {/* Animated Sound Waves with Physics-Based Fading */}
          <AnimatePresence>
            {waves.map(wave => {
              const opacity = getWaveOpacity(wave.progress);
              const size = getWaveSize(wave.progress);
              const color = getWaveColor(wave.progress);
              const leftPos = getWavePosition(wave.progress);
              
              // Don't render if opacity is too low
              if (opacity < 0.02) return null;
              
              return (
                <motion.div
                  key={wave.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: opacity,
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 rounded-full pointer-events-none"
                  style={{
                    width: size,
                    height: size,
                    left: `${leftPos}%`,
                    transform: 'translate(-50%, -50%)',
                    border: `${2 + waveParams.initialOpacity}px solid ${color}`,
                    boxShadow: `0 0 ${10 * opacity}px ${color}`,
                  }}
                />
              );
            })}
          </AnimatePresence>

          {/* Facility Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <motion.div 
              className="bg-watt-navy border-2 border-watt-bitcoin rounded-lg p-3 shadow-lg"
              animate={{
                boxShadow: [
                  `0 0 10px rgba(247, 147, 30, ${waveParams.initialOpacity * 0.3})`,
                  `0 0 20px rgba(247, 147, 30, ${waveParams.initialOpacity * 0.5})`,
                  `0 0 10px rgba(247, 147, 30, ${waveParams.initialOpacity * 0.3})`,
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Factory className="h-8 w-8 text-watt-bitcoin" />
            </motion.div>
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

          {/* House/Receptor with Pulse Animation */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 z-10"
            animate={{ left: `${getHousePosition()}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-2 relative"
              animate={{
                scale: 1 + receptorPulse * 0.15,
                boxShadow: receptorPulse > 0 
                  ? `0 0 ${20 * receptorPulse}px rgba(${resultDb > 45 ? '255, 165, 0' : '39, 174, 96'}, ${receptorPulse * 0.6})`
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 0.15 }}
            >
              <Home className={`h-6 w-6 ${resultDb > 45 ? 'text-yellow-400' : 'text-white'}`} />
              
              {/* Sound reception indicator */}
              {resultDb > 5 && (
                <motion.div
                  className="absolute -right-1 -top-1 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: resultDb > 45 ? '#f59e0b' : '#27ae60',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <Badge className={`${getZoneColor()} bg-black/50 text-xs`}>
                {resultDb.toFixed(1)} dB
              </Badge>
            </div>
          </motion.div>

          {/* Attenuation Arrow */}
          <div className="absolute bottom-2 left-1/4 right-1/4 flex items-center justify-center gap-2">
            <ArrowRight className="h-4 w-4 text-white/30" />
            <span className="text-xs text-white/50">Inverse square law: -6dB per distance doubling</span>
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
