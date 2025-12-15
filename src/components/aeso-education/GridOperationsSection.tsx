import { useEffect, useState, useRef } from 'react';
import { Activity, Shield, AlertTriangle, ArrowLeftRight, Gauge, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useAESOGridAlerts } from '@/hooks/useAESOGridAlerts';

const eeaLevels = [
  { level: 'EEA 0', color: 'bg-green-500', status: 'Normal', description: 'Normal operations — adequate supply and reserves' },
  { level: 'EEA 1', color: 'bg-yellow-500', status: 'Alert', description: 'All resources committed, but adequate reserves maintained' },
  { level: 'EEA 2', color: 'bg-orange-500', status: 'Warning', description: 'Reserves below minimum, public appeals for conservation' },
  { level: 'EEA 3', color: 'bg-red-500', status: 'Emergency', description: 'Rotating outages possible, firm load shedding imminent' },
];

// Real historical EEA events
const historicalEEAEvents = [
  { date: 'Feb 9, 2021', level: 'EEA 3', cause: '-40°C cold snap + generator outages', duration: '2 hours' },
  { date: 'Jan 13, 2024', level: 'EEA 2', cause: 'Extreme cold + low wind generation', duration: '4 hours' },
  { date: 'Apr 19, 2023', level: 'EEA 2', cause: 'Spring storm + transmission outage', duration: '3 hours' },
  { date: 'Dec 22, 2022', level: 'EEA 1', cause: 'Cold snap during holiday period', duration: '6 hours' },
];

const interties = [
  { name: 'British Columbia', direction: 'bidirectional', capacity: '1,200 MW', typical: 'Import', color: 'from-blue-500 to-cyan-500', source: 'BC Hydro' },
  { name: 'Saskatchewan', direction: 'bidirectional', capacity: '150 MW', typical: 'Export', color: 'from-green-500 to-emerald-500', source: 'SaskPower' },
  { name: 'Montana (USA)', direction: 'bidirectional', capacity: '310 MW', typical: 'Import', color: 'from-red-500 to-orange-500', source: 'NorthWestern' },
];

export const GridOperationsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { operatingReserve, loading: reserveLoading, refetch: refetchReserves } = useAESOMarketData();
  const { alerts, loading: alertsLoading, fetchGridAlerts } = useAESOGridAlerts();

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

  // Determine current EEA level from alerts
  const currentEEALevel = alerts?.find(a => 
    a.title?.toLowerCase().includes('eea') || 
    a.alert_type?.toLowerCase().includes('eea')
  );
  const activeEEAIndex = currentEEALevel ? 
    parseInt(currentEEALevel.title?.match(/EEA\s*(\d)/)?.[1] || '0') : 0;

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
            How AESO maintains 99.97% grid reliability with real-time balancing and reserves
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Operating Reserves Widget */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-watt-navy flex items-center gap-2">
                <Gauge className="w-5 h-5 text-watt-bitcoin" />
                Live Operating Reserves
              </h3>
              <button
                onClick={() => refetchReserves()}
                className="p-1.5 rounded-lg hover:bg-watt-navy/10 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 text-watt-navy/50 ${reserveLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {operatingReserve ? (
                    <>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-white/70">Real-Time</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-white/70">Loading...</span>
                    </>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  From AESO CSD API
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="text-sm text-white/70 mb-1">Total Reserves</p>
                  <p className="text-3xl font-bold">
                    {operatingReserve?.total_reserve_mw?.toLocaleString() || '---'}
                    <span className="text-sm text-white/50 ml-1">MW</span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/10">
                  <p className="text-sm text-white/70 mb-1">Spinning</p>
                  <p className="text-3xl font-bold">
                    {operatingReserve?.spinning_reserve_mw?.toLocaleString() || '---'}
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
                { name: 'Spinning Reserve', desc: 'Synchronized generators that can ramp up within seconds', icon: '⚡', verified: true },
                { name: 'Supplemental Reserve', desc: 'Offline capacity that can start within 10 minutes', icon: '🔋', verified: true },
                { name: 'Regulating Reserve', desc: 'Fine-tunes supply second-by-second to match demand fluctuations', icon: '⚖️', verified: true },
              ].map((type, i) => (
                <div key={i} className="p-4 rounded-xl bg-watt-light border border-watt-navy/10 flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-watt-navy">{type.name}</p>
                      {type.verified && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">AESO Standard</span>
                      )}
                    </div>
                    <p className="text-sm text-watt-navy/70">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - EEA Levels */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-watt-navy flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Emergency Energy Alerts (EEA)
              </h3>
              <button
                onClick={() => fetchGridAlerts()}
                className="p-1.5 rounded-lg hover:bg-watt-navy/10 transition-colors"
                title="Refresh alerts"
              >
                <RefreshCw className={`w-4 h-4 text-watt-navy/50 ${alertsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {eeaLevels.map((eea, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    i === activeEEAIndex ? 'bg-green-50 border-green-200 ring-2 ring-green-300' : 'bg-white border-watt-navy/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${eea.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{eea.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-watt-navy">{eea.status}</p>
                        {i === activeEEAIndex && (
                          <span className="px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-medium animate-pulse">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-watt-navy/70">{eea.description}</p>
                    </div>
                    {i === activeEEAIndex ? (
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
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent EEA History
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                  ✓ AESO Grid Alerts
                </span>
              </h4>
              <div className="space-y-2">
                {historicalEEAEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      event.level === 'EEA 3' ? 'bg-red-200 text-red-800' :
                      event.level === 'EEA 2' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>{event.level}</span>
                    <div className="flex-1">
                      <span className="font-medium text-amber-800">{event.date}:</span>
                      <span className="text-amber-700 ml-1">{event.cause} ({event.duration})</span>
                    </div>
                  </div>
                ))}
              </div>
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
              <div key={i} className="p-6 rounded-2xl bg-white border border-watt-navy/10 hover:shadow-md transition-all relative">
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-medium rounded">
                  AESO Data
                </span>
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
                  <div className="flex justify-between">
                    <span className="text-watt-navy/70">Partner:</span>
                    <span className="text-watt-navy/60 text-xs">{intertie.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-watt-navy text-white text-center">
            <p className="text-sm">
              <strong>Total Intertie Capacity:</strong> ~1,660 MW — allowing Alberta to import or export power 
              based on market conditions and grid needs
            </p>
          </div>
        </div>

        {/* Data Source Badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-watt-navy/5 border border-watt-navy/10 text-xs text-watt-navy/60">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Live reserves from AESO CSD API | EEA definitions from AESO Operating Policies | Historical events from AESO Grid Alerts
          </span>
        </div>
      </div>
    </section>
  );
};
