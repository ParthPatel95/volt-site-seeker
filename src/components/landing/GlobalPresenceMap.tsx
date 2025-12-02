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
  { name: 'Canada', flag: canadaFlag, capacity: 333, type: 'Hybrid', x: 18, y: 28, color: '#F7931A' },
  { name: 'United States', flag: usFlag, capacity: 536, type: 'Mix + Natgas', x: 20, y: 40, color: '#F7931A' },
  { name: 'Uganda', flag: ugandaFlag, capacity: 400, type: 'Hydro', x: 55, y: 54, color: '#F7931A' },
  { name: 'Nepal', flag: nepalFlag, capacity: 75, type: 'Mix', x: 70, y: 42, color: '#F7931A' },
  { name: 'Bhutan', flag: bhutanFlag, capacity: 175, type: 'Hydro', x: 72, y: 43, color: '#F7931A' },
  { name: 'India', flag: indiaFlag, capacity: 45, type: 'Solar + Hydro', x: 68, y: 48, color: '#F7931A' },
];

const GlobalPresenceMap: React.FC = () => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const totalCapacity = countries.reduce((sum, country) => sum + country.capacity, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Map Container */}
      <div className="lg:col-span-2 relative">
        <Card className="p-0 bg-watt-navy border-gray-700 shadow-institutional overflow-hidden">
          <div className="relative w-full" style={{ minHeight: '400px' }}>
            {/* World Map Background Image */}
            <img 
              src={worldMapImage} 
              alt="World Map" 
              className="w-full h-auto object-contain"
              style={{ minHeight: '400px' }}
            />
            
            {/* Interactive Markers Overlay */}
            <div className="absolute inset-0">
              {countries.map((country) => {
                const isHovered = hoveredCountry === country.name;
                const isSelected = selectedCountry === country.name;
                const markerSize = Math.max(12, Math.min(24, country.capacity / 25));
                
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
                    {/* Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isHovered || isSelected ? 'animate-pulse' : ''
                      }`}
                      style={{
                        width: `${markerSize * 2.5}px`,
                        height: `${markerSize * 2.5}px`,
                        background: `radial-gradient(circle, #F7931A40 0%, transparent 70%)`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                    
                    {/* Marker Dot */}
                    <div
                      className="relative rounded-full transition-all duration-300 shadow-lg"
                      style={{
                        width: `${markerSize}px`,
                        height: `${markerSize}px`,
                        backgroundColor: '#F7931A',
                        boxShadow: isHovered || isSelected 
                          ? '0 0 20px #F7931A, 0 0 40px rgba(247, 147, 26, 0.5)'
                          : '0 0 10px rgba(247, 147, 26, 0.5)',
                        transform: isHovered || isSelected ? 'scale(1.4)' : 'scale(1)',
                      }}
                    />

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        style={{ top: `-${markerSize + 80}px` }}
                      >
                        <div className="bg-white rounded-lg shadow-2xl p-3 min-w-[180px] border border-gray-200 animate-fade-in">
                          <div className="flex items-center gap-2 mb-1">
                            <img 
                              src={country.flag} 
                              alt={country.name}
                              className="w-5 h-4 object-cover rounded"
                            />
                            <span className="font-semibold text-watt-navy text-sm">
                              {country.name}
                            </span>
                          </div>
                          <div className="text-xs text-watt-navy/70">
                            <div className="font-medium text-bitcoin">{country.capacity}MW</div>
                            <div>{country.type}</div>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"
                          style={{ top: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Legend Panel */}
      <div className="space-y-4">
        <Card className="p-6 bg-white border-gray-200 shadow-institutional">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="font-bold text-watt-navy text-lg">Global Pipeline</h3>
              <Badge variant="secondary" className="bg-bitcoin/10 text-bitcoin border-bitcoin/20 font-bold">
                {totalCapacity.toLocaleString()}MW
              </Badge>
            </div>
            
            <div className="space-y-3">
              {countries
                .sort((a, b) => b.capacity - a.capacity)
                .map((country) => {
                  const isActive = selectedCountry === country.name || hoveredCountry === country.name;
                  
                  return (
                    <div
                      key={country.name}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-300
                        ${isActive 
                          ? 'bg-bitcoin/10 border-2 border-bitcoin/30' 
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                        }
                      `}
                      onMouseEnter={() => setHoveredCountry(country.name)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => setSelectedCountry(country.name === selectedCountry ? null : country.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {country.flag && (
                            <img 
                              src={country.flag} 
                              alt={country.name}
                              className="w-5 h-4 object-cover rounded"
                            />
                          )}
                          <span className="font-semibold text-watt-navy text-sm">
                            {country.name}
                          </span>
                        </div>
                        <span className="font-bold text-bitcoin text-sm">
                          {country.capacity}MW
                        </span>
                      </div>
                      <div className="text-xs text-watt-navy/60">
                        {country.type}
                      </div>
                      
                      {/* Capacity Bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-bitcoin transition-all duration-500"
                          style={{ width: `${(country.capacity / totalCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="p-4 bg-gradient-to-br from-bitcoin/5 to-trust/5 border-bitcoin/20">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-watt-navy">{countries.length}</div>
              <div className="text-xs text-watt-navy/60">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-watt-navy">{totalCapacity}MW</div>
              <div className="text-xs text-watt-navy/60">Total Capacity</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GlobalPresenceMap;
