import { Button } from '@/components/ui/button';
import { FileText, Phone, Mail } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

export const InvestorCTASection = () => {
  return (
    <section className="relative z-10 py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-trust/20">
      <div className="max-w-5xl mx-auto text-center">
        <ScrollReveal direction="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to Invest in Digital Infrastructure?
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
            Join institutional investors capitalizing on the power-to-data arbitrage opportunity. 
            Access exclusive investment materials and speak with our fund managers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg"
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              <FileText className="w-5 h-5 mr-2" />
              Request Investment Materials
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-6 text-lg font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-white/70 mb-3">For investor inquiries:</p>
            <a 
              href="mailto:investors@wattbyte.com" 
              className="inline-flex items-center gap-2 text-white hover:text-watt-bitcoin transition-colors text-lg font-medium"
            >
              <Mail className="w-5 h-5" />
              investors@wattbyte.com
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
