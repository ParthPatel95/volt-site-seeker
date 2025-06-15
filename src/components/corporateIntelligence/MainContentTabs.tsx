
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Building2, TrendingUp, Briefcase, MessageSquare, Settings } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { AnalysisTab } from './AnalysisTab';
import { IntelligenceTab } from './IntelligenceTab';
import { PortfolioTab } from './PortfolioTab';
import { InsightsTab } from './InsightsTab';
import { SettingsTab } from './SettingsTab';
import { Company, LoadingStates, DistressAlert } from '@/types/corporateIntelligence';

interface MainContentTabsProps {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  loadingStates: LoadingStates;
  searchTerm: string;
  industryFilter: string;
  distressAlerts: DistressAlert[];
  aiAnalysis: any;
  onAnalyze: (companyName: string, ticker: string) => Promise<void>;
  onAIAnalysisComplete: (analysis: any) => void;
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSelectCompany: (company: Company) => void;
  onInvestigateAlert: (alert: DistressAlert) => void;
}

export function MainContentTabs({
  companies,
  selectedCompany,
  loading,
  loadingStates,
  searchTerm,
  industryFilter,
  distressAlerts,
  aiAnalysis,
  onAnalyze,
  onAIAnalysisComplete,
  onSearchChange,
  onIndustryChange,
  onSelectCompany,
  onInvestigateAlert
}: MainContentTabsProps) {
  return (
    <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm min-w-max sm:min-w-0">
          <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dash</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Analysis</span>
            <span className="sm:hidden">Analyze</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Intelligence</span>
            <span className="sm:hidden">Intel</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
        <DashboardTab
          companies={companies}
          loading={loading}
          onSelectCompany={onSelectCompany}
        />
      </TabsContent>

      <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
        <AnalysisTab
          companies={companies}
          aiAnalysis={aiAnalysis}
          loadingStates={loadingStates}
          searchTerm={searchTerm}
          industryFilter={industryFilter}
          loading={loading}
          onAnalyze={onAnalyze}
          onAIAnalysisComplete={onAIAnalysisComplete}
          onSearchChange={onSearchChange}
          onIndustryChange={onIndustryChange}
          onSelectCompany={onSelectCompany}
        />
      </TabsContent>

      <TabsContent value="intelligence" className="space-y-4 sm:space-y-6">
        <IntelligenceTab />
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-4 sm:space-y-6">
        <PortfolioTab />
      </TabsContent>

      <TabsContent value="insights" className="space-y-4 sm:space-y-6">
        <InsightsTab />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 sm:space-y-6">
        <SettingsTab
          distressAlerts={distressAlerts}
          onInvestigateAlert={onInvestigateAlert}
        />
      </TabsContent>
    </Tabs>
  );
}
