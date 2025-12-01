import './landing-animations.css';

export const DatacenterAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Technical grid pattern */}
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

      {/* Detailed Datacenter Illustration */}
      <svg 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl opacity-10"
        viewBox="0 0 1000 700" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for depth */}
          <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--watt-navy))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--watt-navy))" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Power Infrastructure - High Voltage Lines */}
        <g className="power-infrastructure">
          <line x1="50" y1="50" x2="950" y2="50" stroke="hsl(var(--watt-bitcoin))" strokeWidth="3" strokeDasharray="12,6" className="animate-power-flow" />
          <line x1="50" y1="650" x2="950" y2="650" stroke="hsl(var(--watt-bitcoin))" strokeWidth="3" strokeDasharray="12,6" className="animate-power-flow" style={{ animationDelay: '1s' }} />
          <line x1="50" y1="50" x2="50" y2="650" stroke="hsl(var(--watt-bitcoin))" strokeWidth="3" strokeDasharray="12,6" className="animate-power-flow" style={{ animationDelay: '0.5s' }} />
          <line x1="950" y1="50" x2="950" y2="650" stroke="hsl(var(--watt-bitcoin))" strokeWidth="3" strokeDasharray="12,6" className="animate-power-flow" style={{ animationDelay: '1.5s' }} />
          
          {/* Power distribution nodes */}
          <circle cx="50" cy="50" r="6" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" />
          <circle cx="950" cy="50" r="6" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="50" cy="650" r="6" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="950" cy="650" r="6" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" style={{ animationDelay: '1.5s' }} />
        </g>

        {/* Data Flow Particles */}
        <g className="data-flow">
          <circle cx="200" cy="300" r="3" fill="hsl(var(--watt-trust))" opacity="0.8" className="animate-data-flow" />
          <circle cx="400" cy="320" r="3" fill="hsl(var(--watt-trust))" opacity="0.8" className="animate-data-flow" style={{ animationDelay: '0.5s' }} />
          <circle cx="600" cy="310" r="3" fill="hsl(var(--watt-trust))" opacity="0.8" className="animate-data-flow" style={{ animationDelay: '1s' }} />
          <circle cx="800" cy="330" r="3" fill="hsl(var(--watt-trust))" opacity="0.8" className="animate-data-flow" style={{ animationDelay: '1.5s' }} />
        </g>

        {/* Server Racks Row 1 - Bitcoin Mining ASICs */}
        <g className="mining-racks">
          {/* Rack 1 */}
          <g transform="translate(120, 180)">
            <rect x="0" y="0" width="100" height="240" fill="url(#depthGradient)" rx="2" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-bitcoin))" fontSize="9" fontWeight="600">ASIC</text>
            {/* Mining units */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(0, ${30 + i * 35})`}>
                <rect x="8" y="0" width="84" height="30" fill="hsl(var(--watt-navy))" opacity="0.8" />
                <rect x="12" y="4" width="76" height="22" fill="hsl(var(--watt-trust))" opacity="0.6" />
                {/* LEDs */}
                <circle cx="18" cy="15" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                <circle cx="26" cy="15" r="2" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                {/* Hash bars */}
                <rect x="35" y="8" width="12" height="14" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                <rect x="50" y="10" width="12" height="10" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
                <rect x="65" y="9" width="12" height="12" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
              </g>
            ))}
          </g>

          {/* Rack 2 */}
          <g transform="translate(260, 200)">
            <rect x="0" y="0" width="100" height="240" fill="url(#depthGradient)" rx="2" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-bitcoin))" fontSize="9" fontWeight="600">ASIC</text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(0, ${30 + i * 35})`}>
                <rect x="8" y="0" width="84" height="30" fill="hsl(var(--watt-navy))" opacity="0.8" />
                <rect x="12" y="4" width="76" height="22" fill="hsl(var(--watt-trust))" opacity="0.6" />
                <circle cx="18" cy="15" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
                <circle cx="26" cy="15" r="2" fill="hsl(var(--watt-bitcoin))" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.15 + 0.3}s` }} />
                <rect x="35" y="8" width="12" height="14" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1 + 0.2}s` }} />
                <rect x="50" y="10" width="12" height="10" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1 + 0.25}s` }} />
                <rect x="65" y="9" width="12" height="12" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: `${i * 0.1 + 0.3}s` }} />
              </g>
            ))}
          </g>
        </g>

        {/* AI GPU Clusters - Row 2 */}
        <g className="ai-clusters">
          {/* GPU Rack 1 */}
          <g transform="translate(420, 180)">
            <rect x="0" y="0" width="100" height="240" fill="url(#depthGradient)" rx="2" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="9" fontWeight="600">AI GPU</text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(0, ${30 + i * 35})`}>
                <rect x="8" y="0" width="84" height="30" fill="hsl(var(--watt-navy))" opacity="0.8" />
                <rect x="12" y="4" width="76" height="22" fill="hsl(var(--watt-trust))" opacity="0.7" />
                {/* GPU indicators */}
                <circle cx="18" cy="15" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25}s` }} />
                <circle cx="26" cy="15" r="2" fill="hsl(var(--watt-trust))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25 + 0.1}s` }} />
                <circle cx="34" cy="15" r="2" fill="hsl(var(--watt-trust))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25 + 0.15}s` }} />
                {/* Neural network pattern */}
                <circle cx="50" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2}s` }} />
                <circle cx="58" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.1}s` }} />
                <circle cx="66" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.2}s` }} />
                <circle cx="54" cy="18" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
                <circle cx="62" cy="18" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.4}s` }} />
              </g>
            ))}
          </g>

          {/* GPU Rack 2 */}
          <g transform="translate(560, 200)">
            <rect x="0" y="0" width="100" height="240" fill="url(#depthGradient)" rx="2" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="9" fontWeight="600">AI GPU</text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(0, ${30 + i * 35})`}>
                <rect x="8" y="0" width="84" height="30" fill="hsl(var(--watt-navy))" opacity="0.8" />
                <rect x="12" y="4" width="76" height="22" fill="hsl(var(--watt-trust))" opacity="0.7" />
                <circle cx="18" cy="15" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25 + 0.5}s` }} />
                <circle cx="26" cy="15" r="2" fill="hsl(var(--watt-trust))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25 + 0.6}s` }} />
                <circle cx="34" cy="15" r="2" fill="hsl(var(--watt-trust))" className="animate-server-blink" style={{ animationDelay: `${i * 0.25 + 0.65}s` }} />
                <circle cx="50" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.5}s` }} />
                <circle cx="58" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.6}s` }} />
                <circle cx="66" cy="10" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.7}s` }} />
                <circle cx="54" cy="18" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.8}s` }} />
                <circle cx="62" cy="18" r="1.5" fill="hsl(var(--watt-trust))" opacity="0.6" className="animate-data-flow" style={{ animationDelay: `${i * 0.2 + 0.9}s` }} />
              </g>
            ))}
          </g>
        </g>

        {/* Cooling System - HVAC Units */}
        <g className="cooling-systems">
          {/* Cooling Unit 1 */}
          <g transform="translate(720, 180)">
            <rect x="0" y="0" width="100" height="120" fill="hsl(var(--watt-navy))" opacity="0.7" rx="4" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-success))" fontSize="9" fontWeight="600">HVAC</text>
            {/* Fan */}
            <g transform="translate(50, 60)">
              <circle cx="0" cy="0" r="25" fill="none" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.5" />
              <line x1="-15" y1="0" x2="15" y2="0" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.6" className="animate-fan-rotate" />
              <line x1="0" y1="-15" x2="0" y2="15" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.6" className="animate-fan-rotate" />
            </g>
            {/* Temperature indicator */}
            <text x="50" y="105" textAnchor="middle" fill="hsl(var(--watt-success))" fontSize="8">18°C</text>
          </g>

          {/* Cooling Unit 2 */}
          <g transform="translate(720, 320)">
            <rect x="0" y="0" width="100" height="120" fill="hsl(var(--watt-navy))" opacity="0.7" rx="4" />
            <text x="50" y="15" textAnchor="middle" fill="hsl(var(--watt-success))" fontSize="9" fontWeight="600">HVAC</text>
            <g transform="translate(50, 60)">
              <circle cx="0" cy="0" r="25" fill="none" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.5" />
              <line x1="-15" y1="0" x2="15" y2="0" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.6" className="animate-fan-rotate" style={{ animationDelay: '1s' }} />
              <line x1="0" y1="-15" x2="0" y2="15" stroke="hsl(var(--watt-trust))" strokeWidth="2" opacity="0.6" className="animate-fan-rotate" style={{ animationDelay: '1s' }} />
            </g>
            <text x="50" y="105" textAnchor="middle" fill="hsl(var(--watt-success))" fontSize="8">18°C</text>
          </g>
        </g>

        {/* Network Infrastructure */}
        <g className="network-switches">
          <g transform="translate(120, 460)">
            <rect x="0" y="0" width="180" height="50" fill="hsl(var(--watt-navy))" opacity="0.8" rx="3" />
            <text x="90" y="20" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="9" fontWeight="600">Network Core</text>
            {/* Port lights */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <circle key={i} cx={20 + i * 16} cy="35" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </g>

          <g transform="translate(420, 460)">
            <rect x="0" y="0" width="180" height="50" fill="hsl(var(--watt-navy))" opacity="0.8" rx="3" />
            <text x="90" y="20" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="9" fontWeight="600">Network Core</text>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <circle key={i} cx={20 + i * 16} cy="35" r="2" fill="hsl(var(--watt-success))" className="animate-server-blink" style={{ animationDelay: `${i * 0.1 + 0.5}s` }} />
            ))}
          </g>
        </g>

        {/* Processing Metrics Dashboard */}
        <g transform="translate(750, 480)">
          <rect x="0" y="0" width="180" height="140" fill="hsl(var(--watt-navy))" opacity="0.8" rx="4" />
          
          {/* Bitcoin Mining */}
          <text x="90" y="25" textAnchor="middle" fill="hsl(var(--watt-bitcoin))" fontSize="11" fontWeight="700">₿ MINING</text>
          <text x="90" y="45" textAnchor="middle" fill="hsl(var(--watt-bitcoin))" fontSize="9">Hash Rate</text>
          <g transform="translate(40, 55)">
            <rect x="0" y="0" width="18" height="25" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" />
            <rect x="24" y="-5" width="18" height="30" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" style={{ animationDelay: '0.2s' }} />
            <rect x="48" y="2" width="18" height="23" fill="hsl(var(--watt-bitcoin))" opacity="0.5" className="animate-hash-pulse" style={{ animationDelay: '0.4s' }} />
            <rect x="72" y="-3" width="18" height="28" fill="hsl(var(--watt-bitcoin))" opacity="0.6" className="animate-hash-pulse" style={{ animationDelay: '0.6s' }} />
          </g>

          {/* AI Training */}
          <text x="90" y="105" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="11" fontWeight="700">AI TRAINING</text>
          <text x="90" y="125" textAnchor="middle" fill="hsl(var(--watt-trust))" fontSize="9">GPU Utilization</text>
          <rect x="40" y="130" width="100" height="6" fill="hsl(var(--watt-trust))" opacity="0.3" rx="3" />
          <rect x="40" y="130" width="87" height="6" fill="hsl(var(--watt-trust))" opacity="0.8" rx="3" className="animate-progress-bar" />
        </g>
      </svg>

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 pointer-events-none" />
    </div>
  );
};
