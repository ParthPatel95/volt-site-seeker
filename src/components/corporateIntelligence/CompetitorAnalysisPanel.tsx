import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function CompetitorAnalysisPanel() {
  const isMobile = useIsMobile();
  
  const competitors = [
    {
      name: 'TechCorp Industries',
      marketShare: 15.2,
      powerUsage: 38.5,
      trend: 'up',
      strengths: ['Strong R&D', 'Market presence'],
      weaknesses: ['High costs', 'Limited expansion']
    },
    {
      name: 'InnovateTech Solutions',
      marketShare: 12.8,
      powerUsage: 42.1,
      trend: 'down',
      strengths: ['Innovation', 'Agility'],
      weaknesses: ['Small scale', 'Limited resources']
    },
    {
      name: 'Global Energy Systems',
      marketShare: 18.5,
      powerUsage: 55.3,
      trend: 'up',
      strengths: ['Scale', 'Distribution'],
      weaknesses: ['Legacy systems', 'Slow innovation']
    }
  ];

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="Competitor Analysis"
        icon={Users}
        priority="high"
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {competitors.map((competitor, index) => (
            <EnhancedCard
              key={index}
              title={competitor.name}
              icon={Target}
              priority="medium"
              className="border-l-4 border-l-orange-500"
              headerActions={
                competitor.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )
              }
            >
              <div className="space-y-4">
                {/* Metrics Grid */}
                <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-4'}`}>
                  <div className="p-3 rounded-md bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Market Share</span>
                    <div className="font-bold text-lg text-foreground">{competitor.marketShare}%</div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Power Usage</span>
                    <div className="font-bold text-lg text-foreground">{competitor.powerUsage} MW</div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Strengths
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {competitor.strengths.map((strength, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/30"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Weaknesses
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {competitor.weaknesses.map((weakness, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs border-destructive/30 bg-destructive/10"
                      >
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
      </EnhancedCard>
    </div>
  );
}
