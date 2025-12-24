import { Target, CheckCircle } from "lucide-react";

interface ScalingLearningObjectivesProps {
  objectives: string[];
  sectionTitle?: string;
}

export const ScalingLearningObjectives = ({ 
  objectives, 
  sectionTitle = "Learning Objectives" 
}: ScalingLearningObjectivesProps) => {
  return (
    <div className="bg-watt-success/5 border border-watt-success/20 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-watt-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{sectionTitle}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        By the end of this section, you will be able to:
      </p>
      <ul className="space-y-3">
        {objectives.map((objective, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
            <span className="text-foreground">{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
