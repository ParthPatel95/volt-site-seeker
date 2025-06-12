
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative z-10 pt-20 pb-24 px-6">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 border-electric-blue/50 text-electric-blue bg-electric-blue/10">
          Fund I • $25M Target • 2.0-2.5x MOIC
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          Turning Power<br />into Profit
        </h1>
        
        <p className="text-xl text-slate-200 mb-8 max-w-4xl mx-auto leading-relaxed">
          Next-generation infrastructure fund acquiring power-rich land across North America 
          for AI, HPC, and crypto data centers. Backed by 675MW+ of deal experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/voltscout">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-8 py-4 text-lg"
            >
              Request Platform Access
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-slate-500 text-black hover:bg-slate-800 hover:text-white px-8 py-4 text-lg bg-white">
            View Pipeline
          </Button>
        </div>
      </div>
    </section>
  );
};
