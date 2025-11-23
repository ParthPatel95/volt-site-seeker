import { ModelImprovementDashboard } from "@/components/aeso/ModelImprovementDashboard";

const ModelImprovement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Improvement</h1>
        <p className="text-muted-foreground mt-2">
          Enhanced AESO price prediction with advanced ML algorithms
        </p>
      </div>
      
      <ModelImprovementDashboard />
    </div>
  );
};

export default ModelImprovement;
