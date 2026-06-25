import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, Compass, Cpu, Zap, Database, Radar, Layers, Globe2, Handshake, FileText, MessagesSquare, ClipboardCheck, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/landing/v2/motion';
import { DatacenterCampusScene3D } from '@/components/landing/v2/DatacenterCampusScene3D';

// WattFund v2 — institutional, light-field sections matching the v2 landing
// language (editorial type, watt-bitcoin accents, restrained motion, semantic
// tokens). All copy is intentionally qualitative — no dollar amounts, MW
// totals, percentages, or year targets — while the fund is being restructured.

// ── Hero ─────────────────────────────────────────────────────────────────────

export function WattFundHeroV2({ onInquiryClick }: { onInquiryClick: () => void }) {
  return (
    <section className="relative pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground mb-8">
                <span className="inline-block w-6 h-px bg-watt-bitcoin" />
                WATTFUND · INSTITUTIONAL CAPITAL
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="font-bold tracking-tight text-foreground leading-[1.05] text-[2.6rem] sm:text-6xl lg:text-[4.25rem]">
                Capital for
                <br />
                power-first
                <br />
                <span className="text-gradient-watt">infrastructure.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 text-lg text-muted-foreground leading-relaxed max-w-xl">
                WattFund backs the acquisition and development of stranded energy
                assets into AI, high-performance computing, and Bitcoin-mining
                datacenters — sourced with proprietary intelligence and operated
                by the WattByte team.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button size="lg" className="h-12 px-7 text-base" onClick={onInquiryClick}>
                  Request the brief <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-12 px-5 text-base text-foreground hover:bg-muted">
                  <Link to="/advisory">
                    See our pipeline <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <DatacenterCampusScene3D
              eager
              className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl ring-1 ring-black/5 shadow-2xl"
              overlay={
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-foreground/65 bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                    Power-first · transmission-connected
                  </span>
                </div>
              }
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Restructuring notice ────────────────────────────────────────────────────

export function RestructuringNotice() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 pb-4">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-watt-bitcoin/10 text-watt-bitcoin">
                <Sparkles className="w-4 h-4" />
              </span>
              <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin">
                Fund update
              </p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              WattFund is being restructured. Target size, terms, and allocation
              details are being finalized — request the updated brief for current
              figures and offering documents.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Thesis ──────────────────────────────────────────────────────────────────

const THESIS = [
  {
    icon: Compass,
    title: 'Acquire stranded power',
    blurb:
      'We target underutilized interconnections, curtailed generation, and distressed industrial sites that already have the one input no one is making more of — energy.',
  },
  {
    icon: Cpu,
    title: 'Develop compute-ready sites',
    blurb:
      'Each site is engineered for dual-workload datacenters: AI / HPC tenants alongside Bitcoin-mining loads that monetize low-price hours and curtailment.',
  },
  {
    icon: Zap,
    title: 'Operate with intelligence',
    blurb:
      'WattByte’s software stack — sourcing, market analytics, and operations — runs in-house. The fund deploys behind an active operator, not a passive thesis.',
  },
];

export function ThesisSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
            Investment thesis
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mb-4 text-foreground">
            Energy is the scarce input of the <span className="text-gradient-watt">compute economy.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12 sm:mb-14">
            WattFund is built around a single conviction: the next decade of
            digital infrastructure will be won at the substation, not the rack.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {THESIS.map((t, i) => (
            <Reveal key={t.title} delay={0.08 * i}>
              <div className="h-full p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-watt-bitcoin/10 text-watt-bitcoin">
                  <t.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Focus areas ─────────────────────────────────────────────────────────────

const FOCUS = [
  {
    icon: Zap,
    title: 'Energy assets',
    blurb:
      'Idle interconnections, behind-the-meter generation, and grid-edge capacity — acquired ahead of the broader market.',
  },
  {
    icon: Database,
    title: 'Datacenter conversions',
    blurb:
      'Industrial sites and legacy facilities re-engineered into modern AI, HPC, and mining campuses.',
  },
  {
    icon: Cpu,
    title: 'Compute & hosting',
    blurb:
      'Operating capacity hosting institutional miners and HPC tenants under long-term commercial structures.',
  },
];

export function FocusAreasSection() {
  return (
    <section className="py-20 sm:py-24 px-6 sm:px-10 lg:px-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
            What WattFund invests in
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl mb-12 text-foreground">
            Three categories. One power-first thesis.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FOCUS.map((f, i) => (
            <Reveal key={f.title} delay={0.08 * i}>
              <div className="h-full p-7 rounded-2xl border border-border bg-background">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                    <f.icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why WattFund ────────────────────────────────────────────────────────────

const WHY = [
  {
    icon: Layers,
    title: 'Operator-led',
    blurb: 'Capital sits behind a team that develops and operates the assets directly — not a passive allocator.',
  },
  {
    icon: Radar,
    title: 'Software-driven sourcing',
    blurb: 'Proprietary discovery tools surface power opportunities before they reach the broader market.',
  },
  {
    icon: Globe2,
    title: 'Cross-border reach',
    blurb: 'An active pipeline spanning Canadian and U.S. markets, with strategic positions in industrial corridors.',
  },
  {
    icon: Handshake,
    title: 'Aligned structure',
    blurb: 'Long-duration capital matched to long-duration infrastructure — terms designed around hosts, tenants, and partners.',
  },
];

export function WhyWattFundSection() {
  return (
    <section className="py-24 sm:py-28 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
            Why WattFund
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mb-12 text-foreground">
            An infrastructure fund built by <span className="text-gradient-watt">infrastructure operators.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={0.06 * i}>
              <div className="h-full p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-watt-bitcoin/10 text-watt-bitcoin">
                  <w.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Process ─────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: MessagesSquare, label: 'Introduction', blurb: 'A short conversation to confirm fit and mutual interest.' },
  { icon: FileText, label: 'Diligence materials', blurb: 'Access to the updated brief and supporting documents.' },
  { icon: Handshake, label: 'Investor discussion', blurb: 'A working session with the WattByte team on strategy and structure.' },
  { icon: ClipboardCheck, label: 'Allocation', blurb: 'Subscription documents and onboarding through our administrator.' },
];

export function ProcessSection() {
  return (
    <section className="py-20 sm:py-24 px-6 sm:px-10 lg:px-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
            Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl mb-12 text-foreground">
            A clear path from introduction to allocation.
          </h2>
        </Reveal>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.label} delay={0.06 * i}>
              <li className="h-full p-6 rounded-2xl border border-border bg-background">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono tracking-widest text-muted-foreground">
                    0{i + 1}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <s.icon className="w-4 h-4 text-watt-bitcoin" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">{s.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.blurb}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Closing CTA ─────────────────────────────────────────────────────────────

export function ClosingCta({ onInquiryClick }: { onInquiryClick: () => void }) {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-5xl mx-auto text-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-4">
            Speak with the team
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05] mb-6">
            Request the updated <span className="text-gradient-watt">WattFund brief.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-9">
            Updated terms, current pipeline, and offering documents are shared
            directly with prospective investors on request.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="h-12 px-7 text-base" onClick={onInquiryClick}>
              Request the brief <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 px-5 text-base text-foreground hover:bg-muted">
              <Link to="/about-us">
                Meet the team <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
            For accredited and institutional investors · Information provided on request
          </p>
        </Reveal>
      </div>
    </section>
  );
}
