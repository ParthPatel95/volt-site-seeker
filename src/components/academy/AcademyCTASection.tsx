import { ArrowRight, Bitcoin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { useNavigate } from "react-router-dom";

export const AcademyCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-watt-navy to-watt-navy/95 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-watt-bitcoin rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-watt-blue rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Whether you're an investor looking to understand the fundamentals or an operator 
              seeking technical knowledge, WattByte Academy has you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white"
                onClick={() => navigate('/bitcoin')}
              >
                <Bitcoin className="w-5 h-5 mr-2" />
                Start with Bitcoin 101
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/aeso-101')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Jump to Energy Markets
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/50 text-sm mb-4">Trusted by investors and operators worldwide</p>
              <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm">
                <span>✓ No signup required</span>
                <span>✓ Always free</span>
                <span>✓ Industry-verified content</span>
                <span>✓ Updated regularly</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
