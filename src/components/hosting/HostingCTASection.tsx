import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Zap, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { HostingInquiryForm } from './HostingInquiryForm';

export const HostingCTASection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-watt-bitcoin/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-watt-trust/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <ScrollReveal>
          {/* Urgency Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-watt-success/20 border border-watt-success/30 rounded-full mb-6 animate-pulse">
            <Zap className="w-4 h-4 text-watt-success" />
            <span className="text-sm font-medium text-watt-success">Limited Capacity Available</span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Contact our team to discuss your hosting requirements and get a custom quote tailored to your needs
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="group bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white shadow-lg shadow-watt-bitcoin/30 hover:shadow-xl hover:shadow-watt-bitcoin/40 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Request Information
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              onClick={() => window.location.href = 'mailto:contact@wattbyte.com'}
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>

          {/* Response Time Indicator */}
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
            <Clock className="w-5 h-5 text-watt-bitcoin" />
            <span className="text-sm text-white/70">
              Average response time: <span className="font-semibold text-white">Under 2 hours</span>
            </span>
            <span className="text-white/30">|</span>
            <span className="text-sm text-white/70">Available 24/7</span>
          </div>
        </ScrollReveal>
      </div>

      <HostingInquiryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  );
};
