export const DatacenterIllustration = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-institutional overflow-hidden">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
          
          {/* Gradient definitions */}
          <linearGradient id="rackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          
          <linearGradient id="floorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        
        {/* Grid background */}
        <rect width="800" height="600" fill="url(#grid)" opacity="0.3"/>
        
        {/* Floor */}
        <path
          d="M 100 500 L 700 500 L 600 550 L 200 550 Z"
          fill="url(#floorGradient)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        
        {/* Server Rack 1 - Bitcoin (Left) */}
        <g className="server-rack" transform="translate(150, 200)">
          {/* Rack frame */}
          <path d="M 0 0 L 80 0 L 80 250 L 0 250 Z" fill="url(#rackGradient)" stroke="#334155" strokeWidth="2"/>
          <path d="M 80 0 L 100 20 L 100 270 L 80 250 Z" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <path d="M 0 0 L 20 20 L 100 20 L 80 0 Z" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
          
          {/* Server units with LEDs */}
          {[0, 1, 2, 3, 4, 5].map((unit) => (
            <g key={unit}>
              <rect x="5" y={10 + unit * 38} width="70" height="32" fill="#334155" rx="2"/>
              {/* LED indicators - Bitcoin orange */}
              <circle cx="15" cy={26 + unit * 38} r="2" fill="#F7931A" className="animate-server-blink" style={{ animationDelay: `${unit * 0.2}s` }}/>
              <circle cx="25" cy={26 + unit * 38} r="2" fill="#F7931A" className="animate-server-blink" style={{ animationDelay: `${unit * 0.2 + 0.1}s` }}/>
              <circle cx="35" cy={26 + unit * 38} r="2" fill="#F7931A" className="animate-server-blink" style={{ animationDelay: `${unit * 0.2 + 0.2}s` }}/>
              {/* Vent lines */}
              <line x1="45" y1={16 + unit * 38} x2="65" y2={16 + unit * 38} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={22 + unit * 38} x2="65" y2={22 + unit * 38} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={28 + unit * 38} x2="65" y2={28 + unit * 38} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={34 + unit * 38} x2="65" y2={34 + unit * 38} stroke="#475569" strokeWidth="1"/>
            </g>
          ))}
          
          {/* Cooling fan at top */}
          <circle cx="40" cy="260" r="8" fill="#64748b" stroke="#475569" strokeWidth="1"/>
          <g className="animate-fan-rotate" style={{ transformOrigin: '40px 260px' }}>
            <rect x="36" y="256" width="8" height="8" fill="#475569"/>
            <rect x="38" y="252" width="4" height="16" fill="#475569"/>
          </g>
        </g>
        
        {/* Server Rack 2 - AI (Center) */}
        <g className="server-rack" transform="translate(360, 180)">
          {/* Rack frame */}
          <path d="M 0 0 L 80 0 L 80 270 L 0 270 Z" fill="url(#rackGradient)" stroke="#334155" strokeWidth="2"/>
          <path d="M 80 0 L 100 20 L 100 290 L 80 270 Z" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <path d="M 0 0 L 20 20 L 100 20 L 80 0 Z" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
          
          {/* Server units with LEDs */}
          {[0, 1, 2, 3, 4, 5, 6].map((unit) => (
            <g key={unit}>
              <rect x="5" y={10 + unit * 36} width="70" height="30" fill="#334155" rx="2"/>
              {/* LED indicators - AI blue */}
              <circle cx="15" cy={25 + unit * 36} r="2" fill="#0052FF" className="animate-server-blink" style={{ animationDelay: `${unit * 0.15}s` }}/>
              <circle cx="25" cy={25 + unit * 36} r="2" fill="#0052FF" className="animate-server-blink" style={{ animationDelay: `${unit * 0.15 + 0.1}s` }}/>
              <circle cx="35" cy={25 + unit * 36} r="2" fill="#0052FF" className="animate-server-blink" style={{ animationDelay: `${unit * 0.15 + 0.2}s` }}/>
              {/* Vent lines */}
              <line x1="45" y1={15 + unit * 36} x2="65" y2={15 + unit * 36} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={21 + unit * 36} x2="65" y2={21 + unit * 36} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={27 + unit * 36} x2="65" y2={27 + unit * 36} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={33 + unit * 36} x2="65" y2={33 + unit * 36} stroke="#475569" strokeWidth="1"/>
            </g>
          ))}
          
          {/* Cooling fan at top */}
          <circle cx="40" cy="280" r="8" fill="#64748b" stroke="#475569" strokeWidth="1"/>
          <g className="animate-fan-rotate" style={{ transformOrigin: '40px 280px', animationDelay: '0.5s' }}>
            <rect x="36" y="276" width="8" height="8" fill="#475569"/>
            <rect x="38" y="272" width="4" height="16" fill="#475569"/>
          </g>
        </g>
        
        {/* Server Rack 3 - HPC (Right) */}
        <g className="server-rack" transform="translate(570, 210)">
          {/* Rack frame */}
          <path d="M 0 0 L 80 0 L 80 240 L 0 240 Z" fill="url(#rackGradient)" stroke="#334155" strokeWidth="2"/>
          <path d="M 80 0 L 100 20 L 100 260 L 80 240 Z" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <path d="M 0 0 L 20 20 L 100 20 L 80 0 Z" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
          
          {/* Server units with LEDs */}
          {[0, 1, 2, 3, 4].map((unit) => (
            <g key={unit}>
              <rect x="5" y={10 + unit * 44} width="70" height="38" fill="#334155" rx="2"/>
              {/* LED indicators - HPC green */}
              <circle cx="15" cy={29 + unit * 44} r="2" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${unit * 0.25}s` }}/>
              <circle cx="25" cy={29 + unit * 44} r="2" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${unit * 0.25 + 0.1}s` }}/>
              <circle cx="35" cy={29 + unit * 44} r="2" fill="#22c55e" className="animate-server-blink" style={{ animationDelay: `${unit * 0.25 + 0.2}s` }}/>
              {/* Vent lines */}
              <line x1="45" y1={15 + unit * 44} x2="65" y2={15 + unit * 44} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={22 + unit * 44} x2="65" y2={22 + unit * 44} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={29 + unit * 44} x2="65" y2={29 + unit * 44} stroke="#475569" strokeWidth="1"/>
              <line x1="45" y1={36 + unit * 44} x2="65" y2={36 + unit * 44} stroke="#475569" strokeWidth="1"/>
            </g>
          ))}
          
          {/* Cooling fan at top */}
          <circle cx="40" cy="250" r="8" fill="#64748b" stroke="#475569" strokeWidth="1"/>
          <g className="animate-fan-rotate" style={{ transformOrigin: '40px 250px', animationDelay: '1s' }}>
            <rect x="36" y="246" width="8" height="8" fill="#475569"/>
            <rect x="38" y="242" width="4" height="16" fill="#475569"/>
          </g>
        </g>
        
        {/* Power cables */}
        <path
          d="M 190 80 Q 190 150 190 200"
          stroke="#F7931A"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          className="animate-power-flow"
        />
        <path
          d="M 410 60 Q 410 120 410 180"
          stroke="#0052FF"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          className="animate-power-flow"
          style={{ animationDelay: '0.5s' }}
        />
        <path
          d="M 620 90 Q 620 160 620 210"
          stroke="#22c55e"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          className="animate-power-flow"
          style={{ animationDelay: '1s' }}
        />
        
        {/* Data flow particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={150 + i * 150}
            cy={150}
            r="3"
            fill="#3b82f6"
            opacity="0.6"
            className="animate-data-flow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
        
        {/* Power distribution unit at top */}
        <rect x="150" y="50" width="520" height="30" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="4"/>
        <text x="410" y="70" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600">
          POWER DISTRIBUTION
        </text>
        
        {/* Status indicators */}
        <circle cx="170" cy="65" r="4" fill="#22c55e" className="pulse-glow"/>
        <circle cx="650" cy="65" r="4" fill="#22c55e" className="pulse-glow" style={{ animationDelay: '0.5s' }}/>
      </svg>
    </div>
  );
};
