import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import canadaFlag from '@/assets/pipeline/flags/canada-ca.svg';
import usFlag from '@/assets/pipeline/flags/united-states-us.svg';
import ugandaFlag from '@/assets/pipeline/flags/uganda-ug.svg';
import nepalFlag from '@/assets/pipeline/flags/nepal-np.svg';
import bhutanFlag from '@/assets/pipeline/flags/bhutan-bt.svg';
import indiaFlag from '@/assets/pipeline/flags/india-in.svg';

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
        <Card className="p-0 bg-gradient-to-br from-watt-navy to-watt-navy/90 border-gray-700 shadow-institutional overflow-hidden">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-auto"
            style={{ minHeight: '400px' }}
          >
            {/* Background */}
            <rect width="1000" height="500" fill="hsl(var(--watt-navy))" />
            
            {/* Subtle Grid Lines */}
            <g opacity="0.1" stroke="white" strokeWidth="0.5">
              {[...Array(10)].map((_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
              ))}
              {[...Array(20)].map((_, i) => (
                <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" />
              ))}
            </g>

            {/* Simplified World Map Continents */}
            <g opacity="0.15" fill="white" stroke="white" strokeWidth="0.5">
              {/* North America */}
              <path d="M 120 100 Q 150 80 180 90 L 220 120 Q 240 140 250 180 L 240 220 Q 220 240 200 250 L 160 240 Q 130 220 120 180 Z" />
              <path d="M 160 140 Q 180 130 200 140 L 220 160 Q 230 180 220 200 L 200 210 Q 180 200 170 180 Z" />
              
              {/* South America */}
              <path d="M 240 280 Q 260 270 280 280 L 290 320 Q 285 360 270 390 L 250 400 Q 230 390 225 360 L 230 320 Z" />
              
              {/* Europe */}
              <path d="M 480 120 Q 510 110 540 120 L 560 140 Q 565 160 555 180 L 530 190 Q 500 185 485 165 Z" />
              
              {/* Africa */}
              <path d="M 500 240 Q 530 230 560 240 L 580 280 Q 585 320 575 360 L 560 390 Q 540 400 520 395 L 495 360 Q 490 310 495 270 Z" />
              
              {/* Asia */}
              <path d="M 600 140 Q 650 120 700 130 L 750 160 Q 780 190 770 230 L 740 260 Q 700 270 660 260 L 620 230 Q 600 200 605 170 Z" />
              
              {/* Australia */}
              <path d="M 750 340 Q 780 330 810 340 L 830 370 Q 835 395 820 410 L 790 415 Q 760 410 750 385 Z" />
            </g>

            {/* Country Markers */}
            {countries.map((country) => {
              const isHovered = hoveredCountry === country.name;
              const isSelected = selectedCountry === country.name;
              const markerSize = Math.max(8, Math.min(20, country.capacity / 30));
              
              return (
                <g
                  key={country.name}
                  transform={`translate(${country.x * 10}, ${country.y * 5})`}
                  onMouseEnter={() => setHoveredCountry(country.name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => setSelectedCountry(country.name === selectedCountry ? null : country.name)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ transformOrigin: 'center' }}
                >
                  {/* Glow Effect */}
                  {(isHovered || isSelected) && (
                    <circle
                      r={markerSize + 8}
                      fill="#F7931A"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Marker */}
                  <circle
                    r={markerSize}
                    fill="#F7931A"
                    opacity={isHovered || isSelected ? 1 : 0.85}
                    className="transition-all duration-300"
                    style={{
                      filter: isHovered || isSelected ? 'drop-shadow(0 0 8px #F7931A)' : 'none'
                    }}
                  />
                  
                  {/* Pulse Ring */}
                  <circle
                    r={markerSize}
                    fill="none"
                    stroke="#F7931A"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <g transform={`translate(${markerSize + 10}, -${markerSize})`}>
                      <rect
                        x="0"
                        y="-20"
                        width="160"
                        height="60"
                        fill="white"
                        rx="8"
                        className="shadow-lg"
                      />
                      <text
                        x="10"
                        y="-2"
                        fill="hsl(var(--watt-navy))"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {country.name}
                      </text>
                      <text
                        x="10"
                        y="15"
                        fill="hsl(var(--watt-navy))"
                        fontSize="12"
                        opacity="0.7"
                      >
                        {country.capacity}MW {country.type}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
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
