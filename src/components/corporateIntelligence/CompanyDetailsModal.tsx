
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Info, 
  Zap, 
  BarChart3, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  TrendingUp, 
  Percent, 
  Activity 
} from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';
import { 
  formatCurrency, 
  formatPercentage, 
  formatDate, 
  getHealthColor,
  getOpportunityScore,
  getRiskLevel
} from '@/utils/corporateIntelligence';

interface CompanyDetailsModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailsModal({ company, open, onOpenChange }: CompanyDetailsModalProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>{company.name}</span>
            {company.ticker && (
              <Badge variant="outline">{company.ticker}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Company Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Industry:</span>
                    <p className="font-medium">{company.industry}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Sector:</span>
                    <p className="font-medium">{company.sector}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Market Cap:</span>
                    <p className="font-medium">{formatCurrency(company.market_cap)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Health Score:</span>
                    <Badge className={`${getHealthColor(company.financial_health_score)} text-white`}>
                      {company.financial_health_score || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Last Analyzed:</span>
                  <p className="text-sm">{formatDate(company.analyzed_at)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Power Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {company.power_usage_estimate || 'N/A'} MW
                  </div>
                  <p className="text-sm text-muted-foreground">Estimated Power Under Management</p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Locations:</span>
                    <p className="font-medium">
                      {Array.isArray(company.locations) ? company.locations.length : 0} facilities
                    </p>
                  </div>
                  {company.locations && Array.isArray(company.locations) && company.locations.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground">Facility Locations:</span>
                      {company.locations.slice(0, 3).map((location: any, idx: number) => (
                        <div key={idx} className="flex items-center text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{location.city}, {location.state} - {location.facility_type}</span>
                        </div>
                      ))}
                      {company.locations.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{company.locations.length - 3} more locations
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold">{formatPercentage(company.revenue_growth)}</div>
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Percent className="w-4 h-4 mr-1 text-green-600" />
                  </div>
                  <div className="text-xl font-bold">{formatPercentage(company.profit_margin)}</div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="w-4 h-4 mr-1 text-orange-600" />
                  </div>
                  <div className="text-xl font-bold">
                    {company.debt_to_equity ? company.debt_to_equity.toFixed(2) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-4 h-4 mr-1 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold">
                    {company.current_ratio ? company.current_ratio.toFixed(2) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Ratio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distress Signals */}
          {company.distress_signals && company.distress_signals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Distress Signals ({company.distress_signals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.distress_signals.map((signal, idx) => (
                    <div key={idx} className="flex items-center p-3 border rounded-lg bg-red-50">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium">{signal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment Opportunity Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                Investment Opportunity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Power Capacity Value:</span>
                    <p className="text-lg font-bold">
                      {company.power_usage_estimate 
                        ? formatCurrency(company.power_usage_estimate * 1000000)
                        : 'N/A'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">Est. @ $1M/MW</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Risk Level:</span>
                    <p className="text-lg font-bold">{getRiskLevel(company)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Opportunity Score:</span>
                    <p className="text-lg font-bold">{getOpportunityScore(company)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
