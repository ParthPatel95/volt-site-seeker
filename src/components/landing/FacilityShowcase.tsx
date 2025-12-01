import { Zap, Server, Wind } from 'lucide-react';
import facilityImage from '@/assets/alberta-facility-aerial.jpg';
import './landing-animations.css';

export const FacilityShowcase = () => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-institutional-lg">
      {/* Base Photo Layer with Ken Burns Effect */}
      <div className="absolute inset-0 animate-ken-burns">
        <img 
          src={facilityImage} 
          alt="Alberta Heartland 135 Facility Aerial View"
          className="w-full h-full object-cover"
          style={{
            filter: 'saturate(0.85) brightness(0.95)',
          }}
        />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-watt-navy/20" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.15)]" />
      </div>

      {/* Animated Technical Overlay (SVG) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F7931A" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F7931A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F7931A" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="computeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0052FF" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0052FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0052FF" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="coolingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D395" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#00D395" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00D395" stopOpacity="0.6" />
          </linearGradient>
          
          {/* Filter for glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Power Flow Lines - from substation to buildings */}
        <path
          d="M 150 300 Q 300 250, 500 320 T 850 300"
          stroke="url(#powerGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="20 10"
          className="animate-power-flow"
          style={{ animationDuration: '8s' }}
        />
        
        <path
          d="M 150 320 Q 250 380, 450 360 T 750 340"
          stroke="url(#computeGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="15 8"
          className="animate-power-flow"
          style={{ animationDuration: '6s', animationDelay: '1s' }}
        />

        {/* Pulsing Hotspots */}
        {/* Substation (left side) - Power */}
        <g className="animate-hotspot-pulse" style={{ transformOrigin: '150px 310px', animationDuration: '3s' }}>
          <circle cx="150" cy="310" r="25" fill="#F7931A" opacity="0.3" filter="url(#glow)" />
          <circle cx="150" cy="310" r="15" fill="#F7931A" opacity="0.6" />
          <circle cx="150" cy="310" r="8" fill="#F7931A" opacity="0.9" />
        </g>

        {/* Main Datacenter Building (center-right) - Computing */}
        <g className="animate-hotspot-pulse" style={{ transformOrigin: '500px 340px', animationDuration: '3.5s', animationDelay: '0.5s' }}>
          <circle cx="500" cy="340" r="25" fill="#0052FF" opacity="0.3" filter="url(#glow)" />
          <circle cx="500" cy="340" r="15" fill="#0052FF" opacity="0.6" />
          <circle cx="500" cy="340" r="8" fill="#0052FF" opacity="0.9" />
        </g>

        {/* Cooling Units (right side) - Operational */}
        <g className="animate-hotspot-pulse" style={{ transformOrigin: '820px 310px', animationDuration: '4s', animationDelay: '1s' }}>
          <circle cx="820" cy="310" r="20" fill="#00D395" opacity="0.3" filter="url(#glow)" />
          <circle cx="820" cy="310" r="12" fill="#00D395" opacity="0.6" />
          <circle cx="820" cy="310" r="6" fill="#00D395" opacity="0.9" />
        </g>

        {/* Circuit-style connection paths */}
        <line x1="150" y1="310" x2="500" y2="340" stroke="#F7931A" strokeWidth="1" opacity="0.4" strokeDasharray="5 5" />
        <line x1="500" y1="340" x2="820" y2="310" stroke="#0052FF" strokeWidth="1" opacity="0.4" strokeDasharray="5 5" />
      </svg>

      {/* Technical Callout Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 135 MW Substation Label */}
        <div 
          className="absolute animate-label-appear"
          style={{ 
            left: '10%', 
            top: '40%',
            animationDelay: '0.5s',
            animationFillMode: 'both'
          }}
        >
          <div className="flex items-center gap-2 bg-watt-navy/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-watt-bitcoin/30">
            <Zap className="w-4 h-4 text-watt-bitcoin" />
            <span>135 MW Substation</span>
          </div>
        </div>

        {/* Air-Cooled DC Label */}
        <div 
          className="absolute animate-label-appear"
          style={{ 
            left: '45%', 
            top: '55%',
            animationDelay: '0.8s',
            animationFillMode: 'both'
          }}
        >
          <div className="flex items-center gap-2 bg-watt-navy/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-watt-trust/30">
            <Server className="w-4 h-4 text-watt-trust" />
            <span>Air-Cooled DC</span>
          </div>
        </div>

        {/* 26 Acres Label */}
        <div 
          className="absolute animate-label-appear"
          style={{ 
            right: '8%', 
            top: '45%',
            animationDelay: '1.1s',
            animationFillMode: 'both'
          }}
        >
          <div className="flex items-center gap-2 bg-watt-navy/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-watt-success/30">
            <Wind className="w-4 h-4 text-watt-success" />
            <span>26 Acres</span>
          </div>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-watt-trust/20 to-transparent animate-scanline" />
    </div>
  );
};
