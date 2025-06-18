
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompanyRealEstateMap } from './CompanyRealEstateMap';
import { DataQualityIndicator } from './DataQualityIndicator';
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Calendar,
  MapPin,
  FileText,
  BarChart3,
  Globe
} from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';

interface CompanyDetailsModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailsModal({ company, open, onOpenChange }: CompanyDetailsModalProps) {
  if (!company) return null;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6" />
              <span>{company.name}</span>
              {company.ticker && (
                <Badge variant="outline">{company.ticker}</Badge>
              )}
            </div>
            <DataQualityIndicator company={company} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Company Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="text-sm font-medium">{company.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sector</p>
                    <p className="text-sm font-medium">{company.sector}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="text-sm font-medium">{formatCurrency(company.market_cap)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {company.financial_health_score || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Financial Health</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Power Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {company.power_usage_estimate || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">MW Estimated</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {company.distress_signals && company.distress_signals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Distress Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {company.distress_signals.map((signal, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{signal}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Analysis Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last analyzed: {new Date(company.analyzed_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Growth</p>
                    <p className="text-sm font-medium">{formatPercentage(company.revenue_growth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit Margin</p>
                    <p className="text-sm font-medium">{formatPercentage(company.profit_margin)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Financial Ratios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Debt to Equity</p>
                    <p className="text-sm font-medium">
                      {company.debt_to_equity ? company.debt_to_equity.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Ratio</p>
                    <p className="text-sm font-medium">
                      {company.current_ratio ? company.current_ratio.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">SEC EDGAR</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Alpha Vantage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs">Yahoo Finance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="real-estate" className="space-y-4">
            <CompanyRealEstateMap company={company} />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Corporate Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Incorporation Date</p>
                    <p className="text-sm font-medium">
                      {company.incorporation_date ? new Date(company.incorporation_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company Status</p>
                    <p className="text-sm font-medium">{company.company_status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jurisdiction</p>
                    <p className="text-sm font-medium">{company.jurisdiction || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Recent News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {company.recent_news && company.recent_news.length > 0 ? (
                    <div className="space-y-2">
                      {company.recent_news.slice(0, 3).map((news: any, index: number) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                          <p className="text-xs font-medium">{news.title}</p>
                          <p className="text-xs text-muted-foreground">{news.source}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent news available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {company.registered_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Registered Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{company.registered_address}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Generate Due Diligence Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
