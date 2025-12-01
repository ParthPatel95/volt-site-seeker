import { Bitcoin, Server, Zap } from 'lucide-react';

export const HeroFloatingElements = () => {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden">
      {/* Bitcoin Mining Element - Top Right */}
      <div className="absolute top-20 right-[10%] animate-float-subtle" style={{ animationDelay: '0s', animationDuration: '6s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-watt-bitcoin/20 blur-xl rounded-full animate-node-pulse" />
          <Bitcoin className="w-16 h-16 text-watt-bitcoin animate-btc-rotate relative z-10" style={{ animationDuration: '20s' }} />
        </div>
      </div>

      {/* Server/Datacenter Element - Middle Left */}
      <div className="absolute top-1/3 left-[8%] animate-float-subtle" style={{ animationDelay: '1s', animationDuration: '7s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-watt-trust/20 blur-xl rounded-full animate-node-pulse" />
          <Server className="w-14 h-14 text-watt-trust relative z-10" />
          {/* Blinking status lights */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-watt-success rounded-full animate-node-pulse" style={{ animationDuration: '1s' }} />
          <div className="absolute top-5 right-2 w-2 h-2 bg-watt-bitcoin rounded-full animate-node-pulse" style={{ animationDuration: '1.5s' }} />
        </div>
      </div>

      {/* Energy Element - Bottom Right */}
      <div className="absolute bottom-32 right-[15%] animate-float-subtle" style={{ animationDelay: '2s', animationDuration: '8s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-watt-success/20 blur-xl rounded-full animate-electric-spark" />
          <Zap className="w-12 h-12 text-watt-success fill-watt-success/20 relative z-10" />
        </div>
      </div>

      {/* Additional Small Elements */}
      <div className="absolute top-1/2 right-[25%] animate-float-subtle" style={{ animationDelay: '1.5s', animationDuration: '9s' }}>
        <Zap className="w-8 h-8 text-watt-bitcoin opacity-30" />
      </div>

      <div className="absolute bottom-1/3 left-[15%] animate-float-subtle" style={{ animationDelay: '2.5s', animationDuration: '10s' }}>
        <Bitcoin className="w-10 h-10 text-watt-trust opacity-20" />
      </div>

      {/* Energy transmission lines - decorative */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <line x1="10%" y1="33%" x2="90%" y2="20%" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" className="text-watt-bitcoin animate-energy-flow" />
        <line x1="8%" y1="50%" x2="85%" y2="70%" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" className="text-watt-trust animate-energy-flow" style={{ animationDelay: '1s' }} />
      </svg>
    </div>
  );
};
