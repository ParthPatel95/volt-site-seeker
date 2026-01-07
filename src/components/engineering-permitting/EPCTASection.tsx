import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EPSectionWrapper } from './shared';
import { Button } from '@/components/ui/button';

const EPCTASection = () => {
  const navigate = useNavigate();

  return (
    <EPSectionWrapper id="cta" theme="accent">
      <ScrollReveal>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            This masterclass covered the essential permitting and engineering requirements for Bitcoin mining in Alberta. 
            Continue learning with our other modules or contact us for project support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/academy')} className="gap-2">
              <BookOpen className="w-5 h-5" />
              Explore More Modules
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')} className="gap-2">
              Back to Home
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default EPCTASection;
