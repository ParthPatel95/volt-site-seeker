import { ArrowRight, Bitcoin, Zap, CheckCircle2, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AcademyCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Start Your Learning Journey
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Choose your path — begin with fundamentals or jump to a topic that matches your experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" className="gap-2" onClick={() => navigate("/bitcoin")}>
              <Bitcoin className="w-5 h-5" />
              Start with Bitcoin 101
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/aeso-101")}>
              <Zap className="w-5 h-5" />
              Energy Markets
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, label: "Always free" },
              { icon: Shield, label: "Industry-verified content" },
              { icon: BookOpen, label: "Self-paced learning" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
