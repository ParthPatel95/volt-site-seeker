
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';

interface DataQualityIndicatorProps {
  company: Company;
}

export function DataQualityIndicator({ company }: DataQualityIndicatorProps) {
  const dataQuality = company.data_quality;
  const dataSources = company.data_sources;
  
  if (!dataQuality || !dataSources) return null;

  const getQualityColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 4) return 'Excellent';
    if (score >= 2) return 'Good';
    return 'Limited';
  };

  const sourceLabels = {
    sec: 'SEC EDGAR',
    alpha_vantage: 'Alpha Vantage',
    yahoo_finance: 'Yahoo Finance',
    open_corporates: 'OpenCorporates',
    news_api: 'News API'
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Data Quality & Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Quality:</span>
          <Badge variant={dataQuality.sources_used >= 3 ? 'default' : 'secondary'}>
            <span className={getQualityColor(dataQuality.sources_used)}>
              {getQualityLabel(dataQuality.sources_used)}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            {dataQuality.has_financial_data ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span>Financial Data</span>
          </div>
          
          <div className="flex items-center gap-1">
            {dataQuality.has_corporate_data ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span>Corporate Data</span>
          </div>
          
          <div className="flex items-center gap-1">
            {dataQuality.has_recent_news ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span>Recent News</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-blue-500" />
            <span>{dataQuality.sources_used} Sources</span>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground mb-1">Active Sources:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(dataSources).map(([key, active]) => (
              <Badge 
                key={key} 
                variant={active ? 'default' : 'outline'} 
                className="text-xs"
              >
                {sourceLabels[key as keyof typeof sourceLabels]}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
