import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import canadaFlag from '@/assets/pipeline/flags/canada-ca.svg';
import usFlag from '@/assets/pipeline/flags/united-states-us.svg';
import ugandaFlag from '@/assets/pipeline/flags/uganda-ug.svg';
import nepalFlag from '@/assets/pipeline/flags/nepal-np.svg';
import bhutanFlag from '@/assets/pipeline/flags/bhutan-bt.svg';
import indiaFlag from '@/assets/pipeline/flags/india-in.svg';
import worldMapImage from '@/assets/world-map.png';

interface CountryData {
  name: string;
  flag: string;
  capacity: number;
  type: string;
  x: number; // SVG percentage position
  y: number;
  color: string;
}

const countries: CountryData[] = [
  { name: 'Canada', flag: canadaFlag, capacity: 333, type: 'Hybrid', x: 22, y: 30, color: '#F7931A' },
  { name: 'United States', flag: usFlag, capacity: 536, type: 'Mix + Natgas', x: 20, y: 40, color: '#F7931A' },
  { name: 'Uganda', flag: ugandaFlag, capacity: 400, type: 'Hydro', x: 54, y: 55, color: '#F7931A' },
  { name: 'Nepal', flag: nepalFlag, capacity: 75, type: 'Mix', x: 68, y: 38, color: '#F7931A' },
  { name: 'Bhutan', flag: bhutanFlag, capacity: 175, type: 'Hydro', x: 69, y: 37, color: '#F7931A' },
  { name: 'India', flag: indiaFlag, capacity: 45, type: 'Solar + Hydro', x: 66, y: 42, color: '#F7931A' },
];

const GlobalPresenceMap: React.FC = () => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const totalCapacity = countries.reduce((sum, country) => sum + country.capacity, 0);

  return (
    <div className="relative">
      {/* Full Width Map Container with Integrated Legend */}
      <Card className="p-0 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-navy/95 border-watt-navy/50 shadow-institutional overflow-hidden">
        <div className="relative">
          {/* World Map */}
          <div className="relative w-full" style={{ minHeight: '500px' }}>
            <img 
              src={worldMapImage} 
              alt="World Map" 
              className="w-full h-auto object-contain opacity-90"
              style={{ minHeight: '500px' }}
            />
            
            {/* Interactive Markers Overlay */}
            <div className="absolute inset-0">
              {countries.map((country) => {
                const isHovered = hoveredCountry === country.name;
                const isSelected = selectedCountry === country.name;
                const markerSize = Math.max(14, Math.min(26, country.capacity / 22));
                
                return (
                  <div
                    key={country.name}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${country.x}%`,
                      top: `${country.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredCountry(country.name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => setSelectedCountry(country.name === selectedCountry ? null : country.name)}
                  >
                    {/* Pulse Ring Animation */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        isHovered || isSelected ? 'animate-ping' : ''
                      }`}
                      style={{
                        width: `${markerSize * 2}px`,
                        height: `${markerSize * 2}px`,
                        background: 'rgba(247, 147, 26, 0.3)',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                    
                    {/* Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isHovered || isSelected ? 'opacity-100' : 'opacity-60'
                      }`}
                      style={{
                        width: `${markerSize * 3}px`,
                        height: `${markerSize * 3}px`,
                        background: `radial-gradient(circle, rgba(247, 147, 26, 0.4) 0%, transparent 70%)`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                    
                    {/* Marker Dot */}
                    <div
                      className="relative rounded-full transition-all duration-300"
                      style={{
                        width: `${markerSize}px`,
                        height: `${markerSize}px`,
                        backgroundColor: '#F7931A',
                        boxShadow: isHovered || isSelected 
                          ? '0 0 24px #F7931A, 0 0 48px rgba(247, 147, 26, 0.6), 0 0 8px rgba(0,0,0,0.3)'
                          : '0 0 12px rgba(247, 147, 26, 0.6), 0 0 4px rgba(0,0,0,0.2)',
                        transform: isHovered || isSelected ? 'scale(1.5)' : 'scale(1)',
                        border: '2px solid rgba(255, 255, 255, 0.9)',
                      }}
                    />

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        style={{ top: `-${markerSize + 85}px` }}
                      >
                        <div className="bg-white rounded-xl shadow-2xl p-4 min-w-[200px] border-2 border-bitcoin/20 animate-fade-in">
                          <div className="flex items-center gap-3 mb-2">
                            <img 
                              src={country.flag} 
                              alt={country.name}
                              className="w-6 h-5 object-cover rounded shadow-sm"
                            />
                            <span className="font-bold text-watt-navy">
                              {country.name}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-lg text-bitcoin">{country.capacity}MW</div>
                            <div className="text-sm text-watt-navy/70">{country.type}</div>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-white"
                          style={{ top: '100%', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Integrated Bottom Legend Bar */}
          <div className="border-t border-white/20 bg-gradient-to-b from-watt-navy via-watt-navy to-[#0d1f3a] backdrop-blur-sm">
            <div className="px-6 py-6">
              {/* Header with Total */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Global Development Pipeline</h3>
                  <p className="text-sm text-white">Six strategic locations across continents</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-bitcoin">{totalCapacity.toLocaleString()}MW</div>
                  <div className="text-xs text-white uppercase tracking-wide">Total Capacity</div>
                </div>
              </div>

              {/* Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {countries
                  .sort((a, b) => b.capacity - a.capacity)
                  .map((country) => {
                    const isActive = selectedCountry === country.name || hoveredCountry === country.name;
                    
                    return (
                      <div
                        key={country.name}
                        className={`
                          group relative p-4 rounded-lg cursor-pointer transition-all duration-300
                          ${isActive 
                            ? 'bg-bitcoin/20 border-2 border-bitcoin shadow-lg scale-105' 
                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }
                        `}
                        onMouseEnter={() => setHoveredCountry(country.name)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onClick={() => setSelectedCountry(country.name === selectedCountry ? null : country.name)}
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={country.flag} 
                            alt={country.name}
                            className="w-8 h-6 object-cover rounded shadow-sm flex-shrink-0 mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white mb-1 truncate text-base">
                              {country.name}
                            </div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xl font-bold text-bitcoin">
                                {country.capacity}
                              </span>
                              <span className="text-sm font-semibold text-white">MW</span>
                            </div>
                            <div className="text-xs text-white font-medium">
                              {country.type}
                            </div>
                          </div>
                        </div>
                        
                        {/* Capacity Bar */}
                        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isActive ? 'bg-bitcoin' : 'bg-bitcoin/60'
                            }`}
                            style={{ width: `${(country.capacity / totalCapacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GlobalPresenceMap;
