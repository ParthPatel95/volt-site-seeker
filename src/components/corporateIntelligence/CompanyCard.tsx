
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, TrendingUp, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';
import { DataQualityIndicator } from './DataQualityIndicator';

interface CompanyCardProps {
  company: Company & {
    data_sources?: any;
    recent_news?: any[];
    data_quality?: any;
  };
  onSelect: (company: Company) => void;
}

export function CompanyCard({ company, onSelect }: CompanyCardProps) {
  const getHealthColor = (score?: number) => {
    if (!score) return 'bg-muted-foreground';
    if (score >= 80) return 'bg-data-positive';
    if (score >= 60) return 'bg-data-warning';
    return 'bg-destructive';
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5" />
              {company.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {company.ticker && (
                <Badge variant="outline" className="text-xs">
                  {company.ticker}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {company.industry}
              </Badge>
            </div>
          </div>
          
          {company.financial_health_score && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(company.financial_health_score)}`} />
              <span className="text-sm font-medium">{company.financial_health_score}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Market Cap:</span>
              <span className="font-medium">{formatCurrency(company.market_cap)}</span>
            </div>
            
            {company.revenue_growth !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue Growth:</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">{company.revenue_growth?.toFixed(1)}%</span>
                </div>
              </div>
            )}
            
            {company.power_usage_estimate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Power Usage:</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">{company.power_usage_estimate} MW</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {company.debt_to_equity !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">D/E Ratio:</span>
                <span className="font-medium">{company.debt_to_equity?.toFixed(2)}</span>
              </div>
            )}
            
            {company.current_ratio !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Ratio:</span>
                <span className="font-medium">{company.current_ratio?.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Analyzed:</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-medium text-xs">{formatDate(company.analyzed_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {company.distress_signals && company.distress_signals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Distress Signals</span>
            </div>
            <div className="space-y-1">
              {company.distress_signals.slice(0, 2).map((signal, index) => (
                <div key={index} className="text-xs text-data-warning bg-data-warning/10 px-2 py-1 rounded">
                  {signal}
                </div>
              ))}
              {company.distress_signals.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{company.distress_signals.length - 2} more signals
                </div>
              )}
            </div>
          </div>
        )}

        {company.recent_news && company.recent_news.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent News</div>
            <div className="space-y-1">
              {company.recent_news.slice(0, 2).map((news: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-muted rounded">
                  <div className="font-medium line-clamp-1">{news.title}</div>
                  <div className="text-muted-foreground">{news.source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DataQualityIndicator company={company} />

        <Button 
          onClick={() => onSelect(company)} 
          className="w-full"
          variant="outline"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
