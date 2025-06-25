
import { TabsContent } from '@/components/ui/tabs';
import { Activity, BarChart3, Users, Settings, Lightbulb, TrendingUp } from 'lucide-react';
import { ResponsiveTabs } from '@/components/ui/responsive-tabs';
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

const tabItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, priority: 1 },
  { id: 'analysis', label: 'Analysis', icon: Activity, priority: 2 },
  { id: 'intelligence', label: 'Intelligence', icon: Lightbulb, priority: 3 },
  { id: 'insights', label: 'Insights', icon: TrendingUp, priority: 4 },
  { id: 'portfolio', label: 'Portfolio', icon: Users, priority: 5 },
  { id: 'settings', label: 'Settings', icon: Settings, priority: 6 }
];

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
    <ResponsiveTabs items={tabItems} defaultValue="dashboard" className="w-full">
      <TabsContent value="dashboard">
        <DashboardTab
          companies={companies}
          distressAlerts={distressAlerts}
          loading={loading}
          onSelectCompany={onSelectCompany}
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
        <SettingsTab 
          distressAlerts={distressAlerts}
          onInvestigateAlert={onInvestigateAlert}
        />
      </TabsContent>
    </ResponsiveTabs>
  );
}
