
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Users, Settings, Lightbulb, TrendingUp } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { AnalysisTab } from './AnalysisTab';
import { IntelligenceTab } from './IntelligenceTab';
import { InsightsTab } from './InsightsTab';
import { PortfolioTab } from './PortfolioTab';
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
  storedAiAnalyses?: any[];
  onAnalyze: (companyName: string, ticker?: string) => Promise<void>;
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
  storedAiAnalyses,
  onAnalyze,
  onAIAnalysisComplete,
  onSearchChange,
  onIndustryChange,
  onSelectCompany,
  onInvestigateAlert
}: MainContentTabsProps) {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-4 sm:mb-6">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex items-center gap-2 text-xs sm:text-sm">
          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Analysis</span>
        </TabsTrigger>
        <TabsTrigger value="intelligence" className="flex items-center gap-2 text-xs sm:text-sm">
          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Intelligence</span>
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2 text-xs sm:text-sm">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Insights</span>
        </TabsTrigger>
        <TabsTrigger value="portfolio" className="flex items-center gap-2 text-xs sm:text-sm">
          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Portfolio</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardTab
          companies={companies}
          distressAlerts={distressAlerts}
          onInvestigateAlert={onInvestigateAlert}
        />
      </TabsContent>

      <TabsContent value="analysis">
        <AnalysisTab
          companies={companies}
          aiAnalysis={aiAnalysis}
          storedAiAnalyses={storedAiAnalyses}
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

      <TabsContent value="intelligence">
        <IntelligenceTab />
      </TabsContent>

      <TabsContent value="insights">
        <InsightsTab />
      </TabsContent>

      <TabsContent value="portfolio">
        <PortfolioTab />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
