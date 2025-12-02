import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrendingUp, Mail } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { InvestmentInquiryForm } from './InvestmentInquiryForm';

export const InvestorCTASection = () => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const handleFormSuccess = () => {
    setShowInquiryForm(false);
  };

  return (
    <>
      <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-watt-navy">
              Start Your Investment Journey
            </DialogTitle>
            <DialogDescription className="text-watt-navy/70">
              Fill out the form below and our investment team will contact you to discuss opportunities in WattFund.
            </DialogDescription>
          </DialogHeader>
          <InvestmentInquiryForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    
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

          <div className="flex justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => setShowInquiryForm(true)}
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-10 py-7 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <TrendingUp className="w-6 h-6 mr-3" />
              Start Investing
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
    </>
  );
};
