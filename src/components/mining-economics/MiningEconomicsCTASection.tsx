import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ArrowRight, Calculator, TrendingUp, Zap } from 'lucide-react';

const MiningEconomicsCTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <div className="bg-watt-navy rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-watt-success/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-watt-bitcoin/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-2 bg-watt-success/20 text-watt-success rounded-full text-sm font-medium mb-6">
                  Module Complete
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Master Mining Economics
                </h2>
                <p className="text-white/70 max-w-2xl mx-auto mb-8">
                  You now understand the financial fundamentals of Bitcoin mining — from 
                  revenue drivers to cost structures, profitability analysis, and strategic 
                  decision-making frameworks.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 rounded-xl p-4">
                    <Calculator className="w-6 h-6 text-watt-success mx-auto mb-2" />
                    <div className="font-semibold">Profitability First</div>
                    <p className="text-xs text-white/60">Model before you commit</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <Zap className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
                    <div className="font-semibold">Energy is Key</div>
                    <p className="text-xs text-white/60">60-80% of your costs</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <TrendingUp className="w-6 h-6 text-watt-purple mx-auto mb-2" />
                    <div className="font-semibold">Plan for Cycles</div>
                    <p className="text-xs text-white/60">Build for all conditions</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    to="/academy" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-watt-success text-white rounded-xl font-semibold hover:bg-watt-success/90 transition-colors"
                  >
                    Back to Academy
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    to="/app/profitability" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                  >
                    Try Profitability Calculator
                  </Link>
                </div>
              </div>
            </div>

            <ScrollReveal delay={200}>
              <div className="mt-12">
                <h3 className="text-xl font-bold text-foreground mb-6 text-center">Continue Learning</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link 
                    to="/site-selection" 
                    className="bg-background rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">📍</div>
                    <h4 className="font-semibold text-foreground group-hover:text-watt-purple transition-colors">
                      Site Selection
                    </h4>
                    <p className="text-sm text-muted-foreground">Find optimal mining locations</p>
                  </Link>
                  <Link 
                    to="/immersion-cooling" 
                    className="bg-background rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">💧</div>
                    <h4 className="font-semibold text-foreground group-hover:text-watt-purple transition-colors">
                      Immersion Cooling
                    </h4>
                    <p className="text-sm text-muted-foreground">Maximize efficiency with liquid cooling</p>
                  </Link>
                  <Link 
                    to="/electrical-infrastructure" 
                    className="bg-background rounded-xl p-4 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-foreground group-hover:text-watt-purple transition-colors">
                      Electrical Infrastructure
                    </h4>
                    <p className="text-sm text-muted-foreground">Power systems for mining</p>
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

export default MiningEconomicsCTASection;
