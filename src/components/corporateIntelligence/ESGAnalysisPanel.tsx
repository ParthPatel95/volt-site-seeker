import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Building, Award } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function ESGAnalysisPanel() {
  const isMobile = useIsMobile();
  
  const esgData = {
    overallScore: 72,
    environmentalScore: 78,
    socialScore: 68,
    governanceScore: 75,
    carbonFootprint: 2.4,
    renewablePercent: 35,
    sustainabilityCommitments: [
      'Net-zero by 2030',
      'Renewable energy transition',
      'Sustainable supply chain',
      'Carbon offset programs'
    ],
    riskFactors: [
      'Regulatory compliance gaps',
      'Limited diversity metrics',
      'Supply chain transparency'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950/20 border-green-200';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="ESG Analysis"
        icon={Leaf}
        priority="high"
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-6">
          {/* Score Cards */}
          <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}`}>
            <div className={`text-center p-4 rounded-lg border ${getScoreBg(esgData.overallScore)}`}>
              <Award className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(esgData.overallScore)}`} />
              <div className="text-xs sm:text-sm font-medium text-foreground">Overall ESG</div>
              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(esgData.overallScore)}`}>
                {esgData.overallScore}
              </div>
            </div>

            <div className={`text-center p-4 rounded-lg border ${getScoreBg(esgData.environmentalScore)}`}>
              <Leaf className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(esgData.environmentalScore)}`} />
              <div className="text-xs sm:text-sm font-medium text-foreground">Environmental</div>
              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(esgData.environmentalScore)}`}>
                {esgData.environmentalScore}
              </div>
            </div>

            <div className={`text-center p-4 rounded-lg border ${getScoreBg(esgData.socialScore)}`}>
              <Users className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(esgData.socialScore)}`} />
              <div className="text-xs sm:text-sm font-medium text-foreground">Social</div>
              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(esgData.socialScore)}`}>
                {esgData.socialScore}
              </div>
            </div>

            <div className={`text-center p-4 rounded-lg border ${getScoreBg(esgData.governanceScore)}`}>
              <Building className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(esgData.governanceScore)}`} />
              <div className="text-xs sm:text-sm font-medium text-foreground">Governance</div>
              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(esgData.governanceScore)}`}>
                {esgData.governanceScore}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
            <EnhancedCard
              title="Environmental Metrics"
              icon={Leaf}
              priority="medium"
              className="border-green-200 bg-green-50/30 dark:bg-green-950/20"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <span className="text-sm text-foreground">Carbon Footprint</span>
                  <span className="font-semibold text-foreground">{esgData.carbonFootprint} MT CO2e</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <span className="text-sm text-foreground">Renewable Energy</span>
                  <span className="font-semibold text-foreground">{esgData.renewablePercent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${esgData.renewablePercent}%` }}
                  />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard
              title="Sustainability Commitments"
              icon={Award}
              priority="medium"
              className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20"
            >
              <div className="space-y-2">
                {esgData.sustainabilityCommitments.map((commitment, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{commitment}</span>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </div>

          {/* Risk Factors */}
          <EnhancedCard
            title="Areas for Improvement"
            icon={Building}
            priority="medium"
            className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/20"
          >
            <div className="flex flex-wrap gap-2">
              {esgData.riskFactors.map((risk, index) => (
                <Badge key={index} variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400">
                  {risk}
                </Badge>
              ))}
            </div>
          </EnhancedCard>
        </div>
      </EnhancedCard>
    </div>
  );
}
