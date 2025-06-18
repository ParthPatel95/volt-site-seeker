
import { CompanyAnalysisForm } from './CompanyAnalysisForm';
import { CompanyFilters } from './CompanyFilters';
import { CompanyCard } from './CompanyCard';
import { AICompanyAnalyzer } from './AICompanyAnalyzer';
import { AIAnalysisDisplay } from './AIAnalysisDisplay';
import { StoredAnalysesDisplay } from './StoredAnalysesDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company, LoadingStates } from '@/types/corporateIntelligence';

interface AnalysisTabProps {
  companies: Company[];
  aiAnalysis: any;
  storedAiAnalyses?: any[];
  loadingStates: LoadingStates;
  searchTerm: string;
  industryFilter: string;
  loading: boolean;
  onAnalyze: (companyName: string, ticker?: string) => Promise<void>;
  onAIAnalysisComplete: (analysis: any) => void;
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSelectCompany: (company: Company) => void;
}

export function AnalysisTab({ 
  companies, 
  aiAnalysis, 
  storedAiAnalyses = [],
  loadingStates, 
  searchTerm, 
  industryFilter, 
  loading,
  onAnalyze,
  onAIAnalysisComplete,
  onSearchChange,
  onIndustryChange,
  onSelectCompany
}: AnalysisTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <AICompanyAnalyzer onAnalysisComplete={onAIAnalysisComplete} />
          {aiAnalysis && <AIAnalysisDisplay analysis={aiAnalysis} />}
          {storedAiAnalyses.length > 0 && (
            <StoredAnalysesDisplay analyses={storedAiAnalyses} />
          )}
        </div>
        <div className="space-y-4 sm:space-y-6">
          <CompanyAnalysisForm onAnalyze={onAnalyze} loading={loadingStates.analyzing} />
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm">Company Database</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <CompanyFilters
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                industryFilter={industryFilter}
                onIndustryChange={onIndustryChange}
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onSelect={onSelectCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
}
