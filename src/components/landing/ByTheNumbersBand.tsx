import React, { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  format?: 'comma' | 'plain';
}

const STATS: Stat[] = [
  { value: 1429, suffix: ' MW', label: 'Global Pipeline', sublabel: 'Across 6 countries', format: 'comma' },
  { value: 135, suffix: ' MW', label: 'Under Development', sublabel: 'Alberta Heartland' },
  { value: 6, label: 'Countries', sublabel: 'Operating footprint' },
  { value: 7, suffix: ' Years', label: 'Operator Track Record', sublabel: 'Since 2019' },
];

const useCountUp = (target: number, durationMs = 1400, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, durationMs]);
  return value;
};

const StatCell: React.FC<{ stat: Stat; visible: boolean; index: number }> = ({ stat, visible, index }) => {
  const v = useCountUp(stat.value, 1200 + index * 150, visible);
  const formatted = stat.format === 'comma' ? v.toLocaleString('en-US') : v.toString();
  return (
    <div className="px-6 py-8 md:py-10 text-center md:text-left">
      <div className="font-mono text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white tabular-nums">
        {stat.prefix}
        {formatted}
        {stat.suffix && <span className="text-watt-bitcoin">{stat.suffix}</span>}
      </div>
      <div className="mt-3 text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
        {stat.label}
      </div>
      {stat.sublabel && (
        <div className="mt-1 text-xs md:text-sm text-white/50">{stat.sublabel}</div>
      )}
    </div>
  );
};

export const ByTheNumbersBand: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="WattByte by the numbers"
      className="relative bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.97)] to-[hsl(var(--watt-navy)/0.92)]"
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-4 md:py-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-watt-bitcoin">
            By the Numbers
          </p>
          <p className="hidden md:block text-[11px] uppercase tracking-[0.14em] text-white/40 font-mono">
            Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {STATS.map((s, i) => (
            <StatCell key={s.label} stat={s} visible={visible} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ByTheNumbersBand;