import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TISectionWrapper } from './shared';

const TaxesInsuranceCTASection = () => {
  return (
    <TISectionWrapper id="cta" theme="dark">
      <ScrollReveal>
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-white/10 text-white/90">
            <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--watt-success))' }} />
            Module Complete
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">You've Completed Taxes & Insurance</h2>
          <p className="text-lg text-white/70 mb-8">You now understand the tax and insurance considerations for Bitcoin mining and traditional data centers, with practical insights from our 45MW Alberta facility.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/academy" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-white text-[hsl(var(--watt-navy))] hover:bg-white/90">
              <BookOpen className="w-5 h-5" />Back to Academy
            </Link>
            <Link to="/strategic-operations" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all border border-white/20 text-white hover:bg-white/10">
              Next: Strategic Operations<ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default TaxesInsuranceCTASection;
