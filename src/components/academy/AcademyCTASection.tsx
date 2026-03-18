import { ArrowRight, Bitcoin, Zap, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AcademyCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-muted-foreground mb-8">
            Begin with Bitcoin fundamentals or jump straight to energy markets 
            based on your experience level.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg"
              className="gap-2"
              onClick={() => navigate('/bitcoin')}
            >
              <Bitcoin className="w-5 h-5" />
              Start with Bitcoin 101
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/aeso-101')}
            >
              <Zap className="w-5 h-5" />
              Jump to Energy Markets
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Always free
            </span>
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-green-500" />
              Sign up free to track progress
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Industry-verified content
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
