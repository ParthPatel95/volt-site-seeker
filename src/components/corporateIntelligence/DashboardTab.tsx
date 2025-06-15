
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, FileText, BarChart3, Settings, Plus } from 'lucide-react';
import { Company } from '@/types/corporateIntelligence';

interface DashboardTabProps {
  companies: Company[];
  loading: boolean;
  onSelectCompany: (company: Company) => void;
}

export function DashboardTab({ companies, loading, onSelectCompany }: DashboardTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="w-5 h-5" />
            Recent Company Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground text-sm">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">No Companies Analyzed</h3>
              <p className="text-sm text-slate-500 mb-3 sm:mb-4">Start by analyzing a company to see insights here</p>
              <Button className="text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Analyze Company
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {companies.slice(0, 3).map((company) => (
                <div key={company.id} className="p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{company.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{company.industry}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        Health: {company.financial_health_score || 'N/A'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => onSelectCompany(company)} className="text-xs">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <AlertTriangle className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
          <Button className="w-full justify-start text-sm" variant="outline">
            <Building2 className="w-4 h-4 mr-2" />
            Analyze New Company
          </Button>
          <Button className="w-full justify-start text-sm" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button className="w-full justify-start text-sm" variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button className="w-full justify-start text-sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
