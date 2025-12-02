import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';
import { HostingInquiryForm } from './HostingInquiryForm';

export const HostingCTASection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Contact our team to discuss your hosting requirements and get a custom quote
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Request Information
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.href = 'mailto:contact@wattbyte.com'}
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>

          <p className="text-sm text-white/60 mt-6">
            Response time: Within 24 hours | Available 24/7
          </p>
        </ScrollReveal>
      </div>

      <HostingInquiryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  );
};
