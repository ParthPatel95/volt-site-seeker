import './landing-animations.css';

export const DatacenterAnimation = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      {/* Professional Card Frame */}
      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-institutional p-6 sm:p-8 h-full">
        <svg
          viewBox="0 0 600 500"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Background - Light Gradient */}
          <rect width="600" height="500" fill="url(#bgGradient)" opacity="0.3"/>
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A1628" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="#F7931A" stopOpacity="0.02"/>
            </linearGradient>
          </defs>

          {/* Server Racks - Simplified (3 Racks) */}
          
          {/* Rack 1 - Bitcoin Mining */}
          <g transform="translate(80, 120)" opacity="0.8">
            <rect x="0" y="0" width="70" height="120" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
            <text x="35" y="18" textAnchor="middle" fill="#F7931A" fontSize="11" fontWeight="600">BTC</text>
            
            {[0, 1, 2, 3].map((i) => (
              <g key={`btc-${i}`} transform={`translate(8, ${28 + i * 22})`}>
                <rect width="54" height="18" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.5"/>
                <circle cx="8" cy="9" r="2.5" fill="#F7931A" className="animate-server-blink" style={{ animationDelay: `${i * 0.4}s` }}/>
                <circle cx="18" cy="9" r="2.5" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${i * 0.4 + 0.2}s` }}/>
              </g>
            ))}
          </g>

          {/* Rack 2 - AI GPU Cluster */}
          <g transform="translate(190, 100)" opacity="0.8">
            <rect x="0" y="0" width="80" height="140" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
            <text x="40" y="18" textAnchor="middle" fill="#0052FF" fontSize="11" fontWeight="600">AI GPU</text>
            
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={`gpu-${i}`} transform={`translate(10, ${28 + i * 22})`}>
                <rect width="60" height="18" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.5"/>
                <circle cx="8" cy="9" r="2.5" fill="#0052FF" className="animate-server-blink" style={{ animationDelay: `${i * 0.35}s` }}/>
                <circle cx="18" cy="9" r="2.5" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${i * 0.35 + 0.15}s` }}/>
              </g>
            ))}
          </g>

          {/* Rack 3 - Hybrid Infrastructure */}
          <g transform="translate(310, 130)" opacity="0.8">
            <rect x="0" y="0" width="70" height="100" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
            <text x="35" y="18" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">HPC</text>
            
            {[0, 1, 2].map((i) => (
              <g key={`hybrid-${i}`} transform={`translate(8, ${28 + i * 22})`}>
                <rect width="54" height="18" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.5"/>
                <circle cx="8" cy="9" r="2.5" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${i * 0.4}s` }}/>
                <circle cx="18" cy="9" r="2.5" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${i * 0.4 + 0.2}s` }}/>
              </g>
            ))}
          </g>

          {/* Cooling System - Simplified */}
          <g transform="translate(430, 160)" opacity="0.7">
            <rect x="0" y="0" width="80" height="70" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5"/>
            <text x="40" y="16" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="600">HVAC</text>
            
            {/* Single cooling fan */}
            <g transform="translate(40, 40)">
              <circle cx="0" cy="0" r="18" fill="none" stroke="#06b6d4" strokeWidth="2"/>
              <g className="animate-fan-rotate">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round"/>
              </g>
            </g>
          </g>

          {/* Network Infrastructure - Simplified */}
          <g transform="translate(140, 280)" opacity="0.7">
            <rect x="0" y="0" width="140" height="35" rx="3" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5"/>
            <text x="70" y="14" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">NETWORK</text>
            
            {/* Network activity lights */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle 
                key={`net-${i}`} 
                cx={25 + i * 22} 
                cy="24" 
                r="3" 
                fill="#22c55e" 
                className="animate-server-blink" 
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </g>

          {/* Power Infrastructure - Simplified */}
          <g transform="translate(80, 50)" opacity="0.6">
            <defs>
              <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F7931A" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#F7931A" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            
            {/* Main power line */}
            <path 
              d="M 0 20 Q 150 20, 300 20" 
              stroke="url(#powerGradient)" 
              strokeWidth="3" 
              fill="none"
              className="animate-power-flow"
              strokeDasharray="80"
              strokeLinecap="round"
            />
            
            {/* Power distribution nodes */}
            <circle cx="80" cy="20" r="4" fill="#fbbf24" opacity="0.8"/>
            <line x1="80" y1="20" x2="80" y2="70" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
            
            <circle cx="190" cy="20" r="4" fill="#fbbf24" opacity="0.8"/>
            <line x1="190" y1="20" x2="190" y2="50" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
            
            <circle cx="310" cy="20" r="4" fill="#fbbf24" opacity="0.8"/>
            <line x1="310" y1="20" x2="310" y2="80" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
          </g>

          {/* Live Metrics Panel - Simplified */}
          <g transform="translate(80, 360)" opacity="0.75">
            <rect x="0" y="0" width="420" height="90" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5"/>
            <text x="210" y="20" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">LIVE OPERATIONS</text>
            
            {/* Three key metrics in a row */}
            <g transform="translate(30, 40)">
              <text x="0" y="0" fill="#F7931A" fontSize="9" fontWeight="600">Bitcoin Hash</text>
              <text x="0" y="15" fill="#fbbf24" fontSize="13" fontWeight="bold">2.4 EH/s</text>
              <rect x="0" y="22" width="80" height="4" rx="2" fill="#1e293b"/>
              <rect x="0" y="22" width="68" height="4" rx="2" fill="#F7931A" className="animate-progress-bar"/>
            </g>
            
            <g transform="translate(160, 40)">
              <text x="0" y="0" fill="#0052FF" fontSize="9" fontWeight="600">GPU Compute</text>
              <text x="0" y="15" fill="#60a5fa" fontSize="13" fontWeight="bold">1.8 PFLOPS</text>
              <rect x="0" y="22" width="80" height="4" rx="2" fill="#1e293b"/>
              <rect x="0" y="22" width="72" height="4" rx="2" fill="#0052FF" className="animate-progress-bar" style={{ animationDelay: '0.3s' }}/>
            </g>
            
            <g transform="translate(290, 40)">
              <text x="0" y="0" fill="#22c55e" fontSize="9" fontWeight="600">Power Draw</text>
              <text x="0" y="15" fill="#4ade80" fontSize="13" fontWeight="bold">135 MW</text>
              <rect x="0" y="22" width="80" height="4" rx="2" fill="#1e293b"/>
              <rect x="0" y="22" width="64" height="4" rx="2" fill="#22c55e" className="animate-progress-bar" style={{ animationDelay: '0.6s' }}/>
            </g>
          </g>

        </svg>
      </div>
    </div>
  );
};
