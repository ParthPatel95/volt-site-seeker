import './landing-animations.css';

export const DatacenterAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-navy"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Isometric Datacenter Illustration */}
      <svg 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-10"
        viewBox="0 0 800 600" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Power Grid Lines */}
        <g className="power-grid">
          <line x1="100" y1="50" x2="700" y2="50" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeDasharray="8,4" className="animate-power-flow" />
          <line x1="100" y1="550" x2="700" y2="550" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeDasharray="8,4" className="animate-power-flow" style={{ animationDelay: '1s' }} />
          <line x1="100" y1="50" x2="100" y2="550" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeDasharray="8,4" className="animate-power-flow" style={{ animationDelay: '0.5s' }} />
          <line x1="700" y1="50" x2="700" y2="550" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeDasharray="8,4" className="animate-power-flow" style={{ animationDelay: '1.5s' }} />
        </g>

        {/* Datacenter Racks - Isometric View */}
        <g className="datacenter-racks">
          {/* Back Row */}
          <g transform="translate(200, 150)">
            <rect x="0" y="0" width="80" height="200" fill="hsl(var(--watt-navy))" opacity="0.8" />
            <rect x="5" y="10" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.6" />
            <rect x="5" y="50" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.6" />
            <rect x="5" y="90" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.6" />
            <rect x="5" y="130" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.6" />
            {/* Server LEDs */}
            <circle cx="15" cy="25" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" />
            <circle cx="15" cy="65" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '0.5s' }} />
            <circle cx="15" cy="105" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1s' }} />
            <circle cx="15" cy="145" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1.5s' }} />
          </g>

          {/* Middle Row */}
          <g transform="translate(350, 180)">
            <rect x="0" y="0" width="80" height="200" fill="hsl(var(--watt-navy))" opacity="0.9" />
            <rect x="5" y="10" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.7" />
            <rect x="5" y="50" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.7" />
            <rect x="5" y="90" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.7" />
            <rect x="5" y="130" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.7" />
            {/* Server LEDs */}
            <circle cx="15" cy="25" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '0.3s' }} />
            <circle cx="15" cy="65" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '0.8s' }} />
            <circle cx="15" cy="105" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1.3s' }} />
            <circle cx="15" cy="145" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1.8s' }} />
          </g>

          {/* Front Row */}
          <g transform="translate(500, 210)">
            <rect x="0" y="0" width="80" height="200" fill="hsl(var(--watt-navy))" />
            <rect x="5" y="10" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.8" />
            <rect x="5" y="50" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.8" />
            <rect x="5" y="90" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.8" />
            <rect x="5" y="130" width="70" height="35" fill="hsl(var(--watt-trust))" opacity="0.8" />
            {/* Server LEDs */}
            <circle cx="15" cy="25" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '0.2s' }} />
            <circle cx="15" cy="65" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '0.7s' }} />
            <circle cx="15" cy="105" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1.2s' }} />
            <circle cx="15" cy="145" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: '1.7s' }} />
          </g>
        </g>

        {/* Bitcoin/AI Processing Indicator - Bottom Right */}
        <g transform="translate(650, 480)">
          <rect x="0" y="0" width="100" height="60" fill="hsl(var(--watt-navy))" opacity="0.7" rx="4" />
          <text x="50" y="20" textAnchor="middle" fill="hsl(var(--watt-bitcoin))" fontSize="10" fontWeight="600">AI/BTC</text>
          {/* Hash rate bars */}
          <rect x="10" y="30" width="15" height="20" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" />
          <rect x="30" y="25" width="15" height="25" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" style={{ animationDelay: '0.2s' }} />
          <rect x="50" y="28" width="15" height="22" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" style={{ animationDelay: '0.4s' }} />
          <rect x="70" y="32" width="15" height="18" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" style={{ animationDelay: '0.6s' }} />
        </g>
      </svg>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 pointer-events-none" />
    </div>
  );
};
