import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';

interface Leader {
  initials: string;
  name: string;
  title: string;
  credential: string;
}

const LEADERS: Leader[] = [
  {
    initials: 'JH',
    name: 'Jay Hao',
    title: 'Chairman',
    credential: 'Former CEO, OKX · 21+ years in fintech & digital asset infrastructure.',
  },
  {
    initials: 'SP',
    name: 'SnehalKumar Patel',
    title: 'President',
    credential: '20+ years delivering super-cell infrastructure across 5 continents.',
  },
];

export const LeadershipStrip: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
            <div className="max-w-2xl">
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-watt-bitcoin mb-3">
                Operator-Led
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
                Built by people who have done it before.
              </h2>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                WattByte is led by veterans of global infrastructure delivery and digital
                asset markets — not pitch decks.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-watt-bitcoin transition-colors"
            >
              Meet the full team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {LEADERS.map((leader, i) => (
            <ScrollReveal key={leader.name} delay={0.1 + i * 0.08}>
              <div className="group relative h-full p-8 md:p-10 bg-card border border-border rounded-2xl hover:border-watt-bitcoin/40 transition-colors">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-watt-navy to-watt-bitcoin flex items-center justify-center text-white font-semibold text-lg md:text-xl shrink-0 shadow-subtle">
                    {leader.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                      {leader.name}
                    </h3>
                    <p className="text-sm font-medium text-watt-bitcoin uppercase tracking-wider mt-0.5">
                      {leader.title}
                    </p>
                    <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {leader.credential}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipStrip;