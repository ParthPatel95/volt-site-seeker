
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioOptimizerPanel } from './PortfolioOptimizerPanel';
import { InvestmentScoringPanel } from './InvestmentScoringPanel';
import { DueDiligencePanel } from './DueDiligencePanel';
import { MarketTimingPanel } from './MarketTimingPanel';

export function PortfolioTab() {
  return (
    <Tabs defaultValue="optimizer" className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-max sm:min-w-0">
          <TabsTrigger value="optimizer" className="text-xs sm:text-sm">Portfolio Optimizer</TabsTrigger>
          <TabsTrigger value="investment" className="text-xs sm:text-sm">Investment Scoring</TabsTrigger>
          <TabsTrigger value="due-diligence" className="text-xs sm:text-sm">Due Diligence</TabsTrigger>
          <TabsTrigger value="market-timing" className="text-xs sm:text-sm">Market Timing</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="optimizer">
        <PortfolioOptimizerPanel />
      </TabsContent>
      <TabsContent value="investment">
        <InvestmentScoringPanel />
      </TabsContent>
      <TabsContent value="due-diligence">
        <DueDiligencePanel />
      </TabsContent>
      <TabsContent value="market-timing">
        <MarketTimingPanel />
      </TabsContent>
    </Tabs>
  );
}
