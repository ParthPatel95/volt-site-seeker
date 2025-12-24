import { Target, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";

interface RiskLearningObjectivesProps {
  objectives: string[];
  sectionTitle: string;
}

export const RiskLearningObjectives = ({ objectives, sectionTitle }: RiskLearningObjectivesProps) => {
  return (
    <ScrollReveal>
      <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Learning Objectives</h3>
            <p className="text-sm text-muted-foreground">{sectionTitle}</p>
          </div>
        </div>
        <ul className="space-y-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{objective}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
};
