import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ArrowRight, BookOpen, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ImmersionCTASection() {
  return (
    <section id="cta" className="py-20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Deploy Immersion Cooling?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're converting existing air-cooled miners or deploying new immersion 
              containers, WattByte can help you maximize efficiency and profitability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/hosting"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors"
              >
                <Phone className="w-5 h-5" />
                Explore Hosting Options
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/academy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border hover:border-cyan-500/50 text-foreground rounded-xl font-medium transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Continue Learning
              </Link>
            </div>
            
            {/* Related Resources */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/hydro-datacenters"
                className="bg-card border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-colors text-left group"
              >
                <div className="text-2xl mb-2">💧</div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-cyan-500 transition-colors">
                  Hydro Datacenters 101
                </h4>
                <p className="text-sm text-muted-foreground">
                  Learn about hydro-cooling infrastructure and Bitmain container systems
                </p>
              </Link>
              <Link
                to="/datacenters#cooling"
                className="bg-card border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-colors text-left group"
              >
                <div className="text-2xl mb-2">❄️</div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-cyan-500 transition-colors">
                  Cooling Deep Dive
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare air, hydro, and immersion cooling methods in detail
                </p>
              </Link>
              <Link
                to="/bitcoin#mining"
                className="bg-card border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-colors text-left group"
              >
                <div className="text-2xl mb-2">₿</div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-cyan-500 transition-colors">
                  Bitcoin Mining Economics
                </h4>
                <p className="text-sm text-muted-foreground">
                  Understand the economics driving mining infrastructure decisions
                </p>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
