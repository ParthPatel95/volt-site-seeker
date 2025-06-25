
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Building2, AlertTriangle, FileText, BarChart3, Settings, Plus, TrendingUp } from 'lucide-react';
import { Company, DistressAlert } from '@/types/corporateIntelligence';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardTabProps {
  companies: Company[];
  distressAlerts: DistressAlert[];
  loading?: boolean;
  onSelectCompany: (company: Company) => void;
  onInvestigateAlert: (alert: DistressAlert) => void;
}

export function DashboardTab({ 
  companies, 
  distressAlerts,
  loading, 
  onSelectCompany,
  onInvestigateAlert 
}: DashboardTabProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}>
      <EnhancedCard
        title="Recent Company Analysis"
        icon={Building2}
        priority="high"
        loading={loading}
        className={isMobile ? '' : 'lg:col-span-2'}
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground text-sm">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Companies Analyzed</h3>
            <p className="text-sm text-slate-500 mb-4">Start by analyzing a company to see insights here</p>
            <Button size={isMobile ? "default" : "sm"} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Analyze Company
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.slice(0, 3).map((company) => (
              <div key={company.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-base truncate">{company.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{company.industry}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      Health: {company.financial_health_score || 'N/A'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSelectCompany(company)}
                      className="text-xs min-h-[32px] px-3"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </EnhancedCard>

      <EnhancedCard
        title="Quick Actions"
        icon={TrendingUp}
        priority="medium"
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        <div className="space-y-3">
          <Button className="w-full justify-start h-12" variant="outline">
            <Building2 className="w-4 h-4 mr-3" />
            <span className="text-left flex-1">Analyze New Company</span>
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <FileText className="w-4 h-4 mr-3" />
            <span className="text-left flex-1">Generate Report</span>
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <BarChart3 className="w-4 h-4 mr-3" />
            <span className="text-left flex-1">View Analytics</span>
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <Settings className="w-4 h-4 mr-3" />
            <span className="text-left flex-1">Configure Alerts</span>
          </Button>
        </div>
      </EnhancedCard>

      {distressAlerts.length > 0 && (
        <EnhancedCard
          title="Alert Summary"
          icon={AlertTriangle}
          priority="high"
          className={isMobile ? 'order-first' : 'lg:col-span-3'}
          collapsible={isMobile}
          defaultExpanded={true}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {distressAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-sm text-red-900 truncate">{alert.company_name}</h5>
                    <p className="text-xs text-red-700 mt-1">{alert.alert_type}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    {alert.severity}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onInvestigateAlert(alert)}
                  className="w-full mt-3 text-xs h-8"
                >
                  Investigate
                </Button>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}
    </div>
  );
}
