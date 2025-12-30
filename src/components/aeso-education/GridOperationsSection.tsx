import { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, ArrowLeftRight, Gauge, CheckCircle2, XCircle, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import { useAESOGridAlerts } from '@/hooks/useAESOGridAlerts';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive
} from './shared';

const eeaLevels = [
  { level: 'EEA 0', color: 'bg-[hsl(var(--watt-success))]', status: 'Normal', description: 'Normal operations — adequate supply and reserves' },
  { level: 'EEA 1', color: 'bg-yellow-500', status: 'Alert', description: 'All resources committed, but adequate reserves maintained' },
  { level: 'EEA 2', color: 'bg-[hsl(var(--watt-bitcoin))]', status: 'Warning', description: 'Reserves below minimum, public appeals for conservation' },
  { level: 'EEA 3', color: 'bg-destructive', status: 'Emergency', description: 'Rotating outages possible, firm load shedding imminent' },
];

const historicalEEAEvents = [
  { date: 'Feb 9, 2021', level: 'EEA 3', cause: '-40°C cold snap + generator outages', duration: '2 hours' },
  { date: 'Jan 13, 2024', level: 'EEA 2', cause: 'Extreme cold + low wind generation', duration: '4 hours' },
  { date: 'Apr 19, 2023', level: 'EEA 2', cause: 'Spring storm + transmission outage', duration: '3 hours' },
  { date: 'Dec 22, 2022', level: 'EEA 1', cause: 'Cold snap during holiday period', duration: '6 hours' },
];

const interties = [
  { name: 'British Columbia', direction: 'bidirectional', capacity: '1,200 MW', typical: 'Import', color: 'hsl(var(--watt-trust))', source: 'BC Hydro' },
  { name: 'Saskatchewan', direction: 'bidirectional', capacity: '150 MW', typical: 'Export', color: 'hsl(var(--watt-success))', source: 'SaskPower' },
  { name: 'Montana (USA)', direction: 'bidirectional', capacity: '310 MW', typical: 'Import', color: 'hsl(var(--watt-bitcoin))', source: 'NorthWestern' },
];

const reserveTypes = [
  { name: 'Spinning Reserve', desc: 'Synchronized generators that can ramp up within seconds', icon: '⚡', verified: true },
  { name: 'Supplemental Reserve', desc: 'Offline capacity that can start within 10 minutes', icon: '🔋', verified: true },
  { name: 'Regulating Reserve', desc: 'Fine-tunes supply second-by-second to match demand fluctuations', icon: '⚖️', verified: true },
];

export const GridOperationsSection = () => {
  const { operatingReserve, loading: reserveLoading, refetch: refetchReserves } = useAESOMarketData();
  const { alerts, loading: alertsLoading, fetchGridAlerts } = useAESOGridAlerts();

  const currentEEALevel = alerts?.find(a => 
    a.title?.toLowerCase().includes('eea') || 
    a.alert_type?.toLowerCase().includes('eea')
  );
  const activeEEAIndex = currentEEALevel ? 
    parseInt(currentEEALevel.title?.match(/EEA\s*(\d)/)?.[1] || '0') : 0;

  return (
    <AESOSectionWrapper theme="light" id="grid-operations">
      <AESOSectionHeader
        badge="Real-Time Monitoring"
        badgeIcon={Activity}
        title="Grid Operations & Reliability"
        description="How AESO maintains 99.97% grid reliability with real-time balancing and reserves. Understanding grid operations is essential for optimizing your participation in the market."
        theme="light"
        align="center"
      />

      {/* Understanding Grid Reliability */}
      <div className="mb-12">
        <AESODeepDive title="How AESO Keeps the Lights On" defaultOpen>
          <div className="space-y-4 text-muted-foreground">
            <p>
              AESO is responsible for maintaining <strong className="text-foreground">real-time balance</strong> between 
              electricity supply and demand across Alberta. This is a continuous process that happens every second of 
              every day, and getting it wrong means blackouts.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">The Balancing Challenge</h4>
                <p className="text-sm">
                  Electricity cannot be economically stored at grid scale, so supply must <strong>exactly match</strong> demand 
                  at all times. Too much supply = grid frequency rises. Too little = frequency drops. Either extreme 
                  can damage equipment and cause cascading failures.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">Why Reserves Matter</h4>
                <p className="text-sm">
                  AESO maintains operating reserves to handle sudden changes — like a large generator tripping offline 
                  or an unexpected demand surge. These reserves can inject or absorb power within seconds to minutes.
                </p>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left - Operating Reserves Widget */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Live Operating Reserves
            </h3>
            <button
              onClick={() => refetchReserves()}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${reserveLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {operatingReserve ? (
                  <>
                    <div className="w-3 h-3 bg-[hsl(var(--watt-success))] rounded-full animate-pulse" />
                    <span className="text-sm text-white/70">Real-Time</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                    <span className="text-sm text-white/70">Loading...</span>
                  </>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
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
            {reserveTypes.map((type, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-4 rounded-xl bg-card border border-border flex items-start gap-3"
              >
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{type.name}</p>
                    {type.verified && (
                      <span className="text-xs text-[hsl(var(--watt-success))] bg-[hsl(var(--watt-success)/0.1)] px-2 py-0.5 rounded-full">AESO Standard</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right - EEA Levels */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              Emergency Energy Alerts (EEA)
            </h3>
            <button
              onClick={() => fetchGridAlerts()}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${alertsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {eeaLevels.map((eea, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  i === activeEEAIndex ? 'bg-[hsl(var(--watt-success)/0.1)] border-[hsl(var(--watt-success)/0.3)] ring-2 ring-[hsl(var(--watt-success)/0.3)]' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${eea.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{eea.level}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{eea.status}</p>
                      {i === activeEEAIndex && (
                        <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--watt-success)/0.2)] text-[hsl(var(--watt-success))] text-xs font-medium animate-pulse">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{eea.description}</p>
                  </div>
                  {i === activeEEAIndex ? (
                    <CheckCircle2 className="w-6 h-6 text-[hsl(var(--watt-success))]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-muted-foreground/20" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Historical EEA Events */}
          <div className="p-4 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
            <h4 className="font-semibold text-foreground mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                Recent EEA History
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))] text-[10px] font-medium rounded-full">
                ✓ AESO Grid Alerts
              </span>
            </h4>
            <div className="space-y-2">
              {historicalEEAEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    event.level === 'EEA 3' ? 'bg-destructive/20 text-destructive' :
                    event.level === 'EEA 2' ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))]' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>{event.level}</span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{event.date}:</span>
                    <span className="text-muted-foreground ml-1">{event.cause} ({event.duration})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intertie Connections */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-foreground text-center mb-6 flex items-center justify-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
          Intertie Connections
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {interties.map((intertie, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-all relative"
            >
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-1.5 py-0.5 bg-[hsl(var(--watt-trust)/0.1)] text-[hsl(var(--watt-trust))] text-[9px] font-medium rounded">
                AESO Data
              </span>
              <div 
                className="w-full h-2 rounded-full mb-4"
                style={{ backgroundColor: intertie.color }}
              />
              <h4 className="text-lg font-bold text-foreground mb-2">{intertie.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-medium text-foreground">{intertie.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typical Flow:</span>
                  <span className={`font-medium ${intertie.typical === 'Import' ? 'text-[hsl(var(--watt-success))]' : 'text-[hsl(var(--watt-trust))]'}`}>
                    {intertie.typical}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partner:</span>
                  <span className="text-muted-foreground/70 text-xs">{intertie.source}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--watt-navy))] text-white text-center">
          <p className="text-sm">
            <strong>Total Intertie Capacity:</strong> ~1,660 MW — allowing Alberta to import or export power 
            based on market conditions and grid needs
          </p>
        </div>
      </div>

      {/* Opportunity for Flexible Loads */}
      <AESOKeyInsight variant="pro-tip" title="Opportunity for Flexible Loads" theme="light">
        <p>
          During EEA events, pool prices often spike to <strong>$999/MWh</strong> or higher. Flexible loads that 
          can curtail during these periods not only avoid extreme costs but can also earn revenue by participating 
          in AESO's Operating Reserve and Demand Response programs. Being "grid-friendly" is profitable!
        </p>
      </AESOKeyInsight>

      {/* Data Source Badge */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
          Live reserves from AESO CSD API | EEA definitions from AESO Operating Policies | Historical events from AESO Grid Alerts
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
