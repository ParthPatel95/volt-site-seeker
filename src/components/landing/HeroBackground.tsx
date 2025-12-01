import { useEffect, useRef } from 'react';

export const HeroBackground = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Circuit Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-bitcoin"/>
          </pattern>
          <linearGradient id="energy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--watt-bitcoin)" stopOpacity="0"/>
            <stop offset="50%" stopColor="var(--watt-bitcoin)" stopOpacity="1"/>
            <stop offset="100%" stopColor="var(--watt-bitcoin)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
        
        {/* Animated Energy Flow Lines */}
        <g className="energy-flows">
          <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="url(#energy-gradient)" strokeWidth="2" strokeDasharray="10,5" className="animate-energy-flow" style={{ animationDelay: '0s' }}/>
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="url(#energy-gradient)" strokeWidth="2" strokeDasharray="10,5" className="animate-energy-flow" style={{ animationDelay: '1.5s' }}/>
          <line x1="10%" y1="80%" x2="90%" y2="80%" stroke="url(#energy-gradient)" strokeWidth="2" strokeDasharray="10,5" className="animate-energy-flow" style={{ animationDelay: '3s' }}/>
        </g>

        {/* Pulsing Power Nodes */}
        <g className="power-nodes">
          <circle cx="15%" cy="20%" r="4" fill="var(--watt-bitcoin)" className="animate-node-pulse" style={{ animationDelay: '0s' }}/>
          <circle cx="45%" cy="20%" r="4" fill="var(--watt-trust)" className="animate-node-pulse" style={{ animationDelay: '0.5s' }}/>
          <circle cx="75%" cy="20%" r="4" fill="var(--watt-success)" className="animate-node-pulse" style={{ animationDelay: '1s' }}/>
          
          <circle cx="30%" cy="50%" r="4" fill="var(--watt-success)" className="animate-node-pulse" style={{ animationDelay: '1.5s' }}/>
          <circle cx="60%" cy="50%" r="4" fill="var(--watt-bitcoin)" className="animate-node-pulse" style={{ animationDelay: '2s' }}/>
          
          <circle cx="20%" cy="80%" r="4" fill="var(--watt-trust)" className="animate-node-pulse" style={{ animationDelay: '2.5s' }}/>
          <circle cx="50%" cy="80%" r="4" fill="var(--watt-success)" className="animate-node-pulse" style={{ animationDelay: '3s' }}/>
          <circle cx="80%" cy="80%" r="4" fill="var(--watt-bitcoin)" className="animate-node-pulse" style={{ animationDelay: '3.5s' }}/>
        </g>
      </svg>

      {/* Floating Data Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-watt-bitcoin rounded-full opacity-30 animate-float-subtle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20 pointer-events-none" />
    </div>
  );
};
