import { ArrowRight, FileText, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

export const NoiseCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Learn More?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our other educational resources or get in touch to discuss 
              noise-optimized facility solutions for your project.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          <ScrollReveal delay={100}>
            <Card className="bg-gradient-to-br from-watt-coinbase/10 to-watt-coinbase/5 border-2 border-watt-coinbase/20 h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 bg-watt-coinbase/20 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-watt-coinbase" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Hydro Datacenters 101</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  Deep dive into hydro-cooled container technology, cooling systems, 
                  and facility design.
                </p>
                <Button 
                  onClick={() => navigate('/hydro-datacenters')}
                  className="w-full bg-watt-coinbase text-white hover:bg-watt-coinbase/90"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Card className="bg-gradient-to-br from-watt-bitcoin/10 to-watt-bitcoin/5 border-2 border-watt-bitcoin/20 h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 bg-watt-bitcoin/20 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-watt-bitcoin" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">WattByte Academy</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  Complete curriculum covering Bitcoin, datacenters, energy markets, 
                  and infrastructure.
                </p>
                <Button 
                  onClick={() => navigate('/academy')}
                  className="w-full bg-watt-bitcoin text-white hover:bg-watt-bitcoin/90"
                >
                  View Curriculum
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="bg-gradient-to-br from-watt-success/10 to-watt-success/5 border-2 border-watt-success/20 h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-12 h-12 bg-watt-success/20 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-watt-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Mining Hosting</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  Host your mining equipment at our noise-optimized, hydro-cooled 
                  Alberta facility.
                </p>
                <Button 
                  onClick={() => navigate('/hosting')}
                  className="w-full bg-watt-success text-white hover:bg-watt-success/90"
                >
                  Explore Hosting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
