
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewsIntelligencePanel } from './NewsIntelligencePanel';
import { PowerForecastingPanel } from './PowerForecastingPanel';
import { CompetitorAnalysisPanel } from './CompetitorAnalysisPanel';
import { SocialSentimentPanel } from './SocialSentimentPanel';

export function IntelligenceTab() {
  return (
    <Tabs defaultValue="news" className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-max sm:min-w-0">
          <TabsTrigger value="news" className="text-xs sm:text-sm">News Intel</TabsTrigger>
          <TabsTrigger value="power" className="text-xs sm:text-sm">Power Forecast</TabsTrigger>
          <TabsTrigger value="competitors" className="text-xs sm:text-sm">Competitors</TabsTrigger>
          <TabsTrigger value="social" className="text-xs sm:text-sm">Social</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="news">
        <NewsIntelligencePanel />
      </TabsContent>
      <TabsContent value="power">
        <PowerForecastingPanel />
      </TabsContent>
      <TabsContent value="competitors">
        <CompetitorAnalysisPanel />
      </TabsContent>
      <TabsContent value="social">
        <SocialSentimentPanel />
      </TabsContent>
    </Tabs>
  );
}
