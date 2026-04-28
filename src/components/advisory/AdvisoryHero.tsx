import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

interface Props { onContact: () => void; onPipeline: () => void; }

export const AdvisoryHero: React.FC<Props> = ({ onContact, onPipeline }) => (
  <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy)/0.85)] overflow-hidden">
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    {/* Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[hsl(var(--watt-bitcoin)/0.08)] rounded-full blur-3xl" />

    <div className="max-w-6xl mx-auto px-6 relative z-10">
      <ScrollReveal>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--watt-bitcoin)/0.12)] border border-[hsl(var(--watt-bitcoin)/0.25)] rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">Introducing WattByte Advisory</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            <span className="block">Powered Land.</span>
            <span className="block bg-gradient-to-r from-watt-bitcoin to-amber-300 bg-clip-text text-transparent">
              Engineered Outcomes.
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto mb-4 leading-relaxed">
            The operator-led advisor helping AI/HPC, Bitcoin mining, and inference clients turn megawatts into compute.
          </p>
          <p className="text-base md:text-lg text-white/55 max-w-2xl mx-auto mb-10">
            From off-market site sourcing to interconnection, permitting, and turnkey energization — we run our own infrastructure, so we know yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="xl" onClick={onContact} className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold gap-2">
              <Briefcase className="w-5 h-5" /> Request a consultation
            </Button>
            <Button size="xl" variant="ghost-dark" onClick={onPipeline} className="font-semibold gap-2">
              Explore our pipeline <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
