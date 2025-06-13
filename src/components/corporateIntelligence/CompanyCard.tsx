
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, TrendingDown, Zap } from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';
import { getHealthColor } from '@/utils/corporateIntelligence';

interface CompanyCardProps {
  company: Company;
  onViewDetails: (company: Company) => void;
}

export function CompanyCard({ company, onViewDetails }: CompanyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{company.name}</h3>
              {company.ticker && (
                <Badge variant="outline">{company.ticker}</Badge>
              )}
              <Badge className={`text-white ${getHealthColor(company.financial_health_score)}`}>
                Health: {company.financial_health_score || 'N/A'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{company.industry} • {company.sector}</span>
              <div className="flex items-center">
                <Building2 className="w-3 h-3 mr-1" />
                {Array.isArray(company.locations) ? company.locations.length : 0} locations
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(company)}>
            View Details
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            <div>
              <p className="text-sm font-medium">
                {company.market_cap ? `$${(company.market_cap / 1000000000).toFixed(1)}B` : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground">Market Cap</p>
            </div>
          </div>

          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">{company.power_usage_estimate || 'N/A'} MW</p>
              <p className="text-xs text-muted-foreground">Est. Power Usage</p>
            </div>
          </div>

          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
            <div>
              <p className="text-sm font-medium">{company.distress_signals?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Distress Signals</p>
            </div>
          </div>
        </div>

        {company.distress_signals && company.distress_signals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {company.distress_signals.map((signal, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {signal}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
