import { useEffect, useState, useRef } from 'react';
import { Activity, Shield, AlertTriangle, ArrowLeftRight, Gauge, CheckCircle2, XCircle } from 'lucide-react';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';

const eeaLevels = [
  { level: 'EEA 0', color: 'bg-green-500', status: 'Normal', description: 'Normal operations — adequate supply' },
  { level: 'EEA 1', color: 'bg-yellow-500', status: 'Alert', description: 'All resources committed, but adequate reserves' },
  { level: 'EEA 2', color: 'bg-orange-500', status: 'Warning', description: 'Reserves below minimum, public appeals for conservation' },
  { level: 'EEA 3', color: 'bg-red-500', status: 'Emergency', description: 'Rotating outages possible, load shedding imminent' },
];

const interties = [
  { name: 'British Columbia', direction: 'bidirectional', capacity: '1200 MW', typical: 'Import', color: 'from-blue-500 to-cyan-500' },
  { name: 'Saskatchewan', direction: 'bidirectional', capacity: '150 MW', typical: 'Export', color: 'from-green-500 to-emerald-500' },
  { name: 'Montana (USA)', direction: 'bidirectional', capacity: '300 MW', typical: 'Import', color: 'from-red-500 to-orange-500' },
];

export const GridOperationsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { operatingReserve, loading } = useAESOMarketData();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-navy/5 border border-watt-navy/10 mb-4">
            <Activity className="w-4 h-4 text-watt-navy" />
            <span className="text-sm font-medium text-watt-navy">Real-Time Monitoring</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Grid <span className="text-watt-bitcoin">Operations</span> & Reliability
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            How AESO maintains 99.99% grid reliability with real-time balancing and reserves
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Operating Reserves Widget */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-watt-bitcoin" />
              Live Operating Reserves
            </h3>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-white/70">Real-Time</span>
                </div>
                <span className="text-xs text-white/50">
                  {loading ? 'Loading...' : 'From AESO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="text-sm text-white/70 mb-1">Total Reserves</p>
                  <p className="text-3xl font-bold">
                    {operatingReserve?.total_reserve_mw || '---'}
                    <span className="text-sm text-white/50 ml-1">MW</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="text-sm text-white/70 mb-1">Spinning</p>
                  <p className="text-3xl font-bold">
                    {operatingReserve?.spinning_reserve_mw || '---'}
                    <span className="text-sm text-white/50 ml-1">MW</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/70">
                  <strong className="text-white">Why it matters:</strong> Reserves must cover the loss of 
                  the largest generator (~500MW) within 10 minutes. More reserves = more grid stability.
                </p>
              </div>
            </div>

            {/* Reserve Types */}
            <div className="space-y-3">
              {[
                { name: 'Spinning Reserve', desc: 'Synchronized generators that can ramp up in seconds', icon: '⚡' },
                { name: 'Supplemental Reserve', desc: 'Offline capacity that can start within 10 minutes', icon: '🔋' },
                { name: 'Regulating Reserve', desc: 'Fine-tunes supply second-by-second to match demand', icon: '⚖️' },
              ].map((type, i) => (
                <div key={i} className="p-4 rounded-xl bg-watt-light border border-watt-navy/10 flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-semibold text-watt-navy">{type.name}</p>
                    <p className="text-sm text-watt-navy/70">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - EEA Levels */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Emergency Energy Alerts (EEA)
            </h3>

            <div className="space-y-3 mb-6">
              {eeaLevels.map((eea, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    i === 0 ? 'bg-green-50 border-green-200' : 'bg-white border-watt-navy/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${eea.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{eea.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-watt-navy">{eea.status}</p>
                        {i === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-medium">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-watt-navy/70">{eea.description}</p>
                    </div>
                    {i === 0 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-watt-navy/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Historical EEA Events */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Recent EEA History</h4>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• <strong>Feb 2021:</strong> EEA 3 declared during -40°C cold snap</li>
                <li>• <strong>Jan 2024:</strong> EEA 2 during extreme cold + wind lull</li>
                <li>• <strong>Most days:</strong> EEA 0 (Normal operations)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intertie Connections */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-watt-navy text-center mb-6 flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-watt-bitcoin" />
            Intertie Connections
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {interties.map((intertie, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-watt-navy/10 hover:shadow-md transition-all">
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${intertie.color} mb-4`} />
                <h4 className="text-lg font-bold text-watt-navy mb-2">{intertie.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-watt-navy/70">Capacity:</span>
                    <span className="font-medium text-watt-navy">{intertie.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/70">Typical Flow:</span>
                    <span className={`font-medium ${intertie.typical === 'Import' ? 'text-green-600' : 'text-blue-600'}`}>
                      {intertie.typical}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-watt-navy text-white text-center">
            <p className="text-sm">
              <strong>Total Intertie Capacity:</strong> ~1,650 MW — allowing Alberta to import or export power 
              based on market conditions and grid needs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
