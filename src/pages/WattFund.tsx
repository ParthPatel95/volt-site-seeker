import React, { useState } from 'react';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SmoothScroll } from '@/components/landing/ScrollAnimations';
import {
  WattFundHeroV2,
  RestructuringNotice,
  ThesisSection,
  FocusAreasSection,
  WhyWattFundSection,
  ProcessSection,
  ClosingCta,
} from '@/components/wattfund/v2/WattFundSections';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { InvestmentInquiryForm } from '@/components/landing/InvestmentInquiryForm';

const WattFund: React.FC = () => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const openInquiry = () => setShowInquiryForm(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SmoothScroll />

      <header>
        <h1 className="sr-only">WattFund — Institutional capital for power-first infrastructure</h1>
        <p className="sr-only">
          WattFund is the investment vehicle behind WattByte, backing the acquisition
          and development of stranded energy assets into AI, HPC, and Bitcoin-mining
          datacenters. The fund is currently being restructured; updated terms and
          offering documents are available on request.
        </p>
      </header>

      <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Request the WattFund brief
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share a few details and our team will follow up with the updated
              materials and a time to speak.
            </DialogDescription>
          </DialogHeader>
          <InvestmentInquiryForm onSuccess={() => setShowInquiryForm(false)} />
        </DialogContent>
      </Dialog>

      <LandingNavigation />

      <main className="relative">
        <WattFundHeroV2 onInquiryClick={openInquiry} />
        <RestructuringNotice />
        <ThesisSection />
        <FocusAreasSection />
        <WhyWattFundSection />
        <ProcessSection />
        <ClosingCta onInquiryClick={openInquiry} />
      </main>

      <LandingFooter />
    </div>
  );
};

export default WattFund;