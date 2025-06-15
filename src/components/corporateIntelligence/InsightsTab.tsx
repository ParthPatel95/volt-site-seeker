
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NaturalLanguageQueryPanel } from './NaturalLanguageQueryPanel';
import { SupplyChainPanel } from './SupplyChainPanel';
import { ESGAnalysisPanel } from './ESGAnalysisPanel';

export function InsightsTab() {
  return (
    <Tabs defaultValue="nlp" className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 min-w-max sm:min-w-0">
          <TabsTrigger value="nlp" className="text-xs sm:text-sm">Natural Language Query</TabsTrigger>
          <TabsTrigger value="supply-chain" className="text-xs sm:text-sm">Supply Chain</TabsTrigger>
          <TabsTrigger value="esg" className="text-xs sm:text-sm">ESG Analysis</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="nlp">
        <NaturalLanguageQueryPanel />
      </TabsContent>
      <TabsContent value="supply-chain">
        <SupplyChainPanel />
      </TabsContent>
      <TabsContent value="esg">
        <ESGAnalysisPanel />
      </TabsContent>
    </Tabs>
  );
}
