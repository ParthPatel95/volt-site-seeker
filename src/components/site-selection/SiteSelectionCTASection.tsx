import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ArrowRight, MapPin, Zap, Building2 } from 'lucide-react';

const SiteSelectionCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted to-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            {/* Main CTA Card */}
            <div className="bg-card-dark rounded-3xl p-8 md:p-12 text-center text-foreground relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-6">
                  Module Complete
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Master the Art of Site Selection
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto mb-8">
                  You now understand the key factors, evaluation methodology, and development 
                  process for acquiring optimal Bitcoin mining sites. Apply this knowledge 
                  to identify your next opportunity.
                </p>

                {/* Key Takeaways */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 rounded-xl p-4">
                    <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <div className="font-semibold text-white">Power First</div>
                    <p className="text-xs text-white/60">Energy cost drives 60-70% of operating economics</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <MapPin className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="font-semibold text-white">Location Matters</div>
                    <p className="text-xs text-white/60">Climate, regulations, and infrastructure all impact success</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <Building2 className="w-6 h-6 text-market-positive mx-auto mb-2" />
                    <div className="font-semibold text-white">Due Diligence</div>
                    <p className="text-xs text-white/60">Thorough analysis prevents costly mistakes</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    to="/academy" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    Back to Academy
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    to="/hosting" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                  >
                    Explore Hosting
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Modules */}
            <ScrollReveal delay={200}>
              <div className="mt-12">
                <h3 className="text-xl font-bold text-foreground mb-6 text-center">Continue Learning</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link 
                    to="/aeso-101" 
                    className="bg-card rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                      AESO Markets
                    </h4>
                    <p className="text-sm text-muted-foreground">Deep dive into Alberta energy markets</p>
                  </Link>
                  <Link 
                    to="/immersion-cooling" 
                    className="bg-card rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">💧</div>
                    <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                      Immersion Cooling
                    </h4>
                    <p className="text-sm text-muted-foreground">Advanced cooling for maximum efficiency</p>
                  </Link>
                  <Link 
                    to="/datacenters" 
                    className="bg-card rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">🏗️</div>
                    <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                      Datacenters 101
                    </h4>
                    <p className="text-sm text-muted-foreground">Mining infrastructure fundamentals</p>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SiteSelectionCTASection;
