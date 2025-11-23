import { useState } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, TrendingUp, Calendar, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function PowerForecastingPanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecasted, setForecasted] = useState(false);
  const isMobile = useIsMobile();

  const generateForecast = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setForecasted(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="Power Consumption Forecasting"
        icon={Zap}
        priority="high"
        loading={loading}
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && generateForecast()}
              className="flex-1"
            />
            <Button 
              onClick={generateForecast} 
              disabled={loading}
              className={isMobile ? 'w-full' : ''}
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>

          {forecasted && (
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
              <EnhancedCard
                title="Current Usage"
                icon={TrendingUp}
                priority="high"
                className="border-green-200 bg-green-50/30 dark:bg-green-950/20"
              >
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                    45.2 MW
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Real-time estimate
                  </div>
                  <div className="pt-2 mt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak Today</span>
                      <span className="font-semibold text-foreground">52.1 MW</span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard
                title="6-Month Forecast"
                icon={Calendar}
                priority="high"
                className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20"
              >
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                    52.8 MW
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    +16.8% growth projected
                  </div>
                  <div className="pt-2 mt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-semibold text-foreground">87%</span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}

          {forecasted && (
            <EnhancedCard
              title="Growth Breakdown"
              icon={Activity}
              priority="medium"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <span className="text-sm text-foreground">Seasonal Variation</span>
                  <span className="font-semibold text-foreground">±8%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <span className="text-sm text-foreground">Operational Expansion</span>
                  <span className="font-semibold text-foreground">+12%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                  <span className="text-sm text-foreground">Efficiency Improvements</span>
                  <span className="font-semibold text-foreground">-3%</span>
                </div>
              </div>
            </EnhancedCard>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
}
