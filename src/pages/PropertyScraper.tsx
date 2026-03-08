import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirecrawlPropertyScanner } from '@/components/scraping/FirecrawlPropertyScanner';
import { AIPropertyScraper } from '@/components/scraping/AIPropertyScraper';
import { ComprehensiveScraper } from '@/components/scraping/ComprehensiveScraper';
import { FreeDataSources } from '@/components/scraping/FreeDataSources';
import { ScrapedPropertiesDisplay } from '@/components/scraping/ScrapedPropertiesDisplay';

export default function PropertyScraper() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePropertiesFound = (count: number) => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Property Scraper</h1>
        <p className="text-muted-foreground">Discover industrial properties from multiple data sources</p>
      </div>

      <Tabs defaultValue="firecrawl" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="firecrawl">Firecrawl Scanner</TabsTrigger>
          <TabsTrigger value="brokerage">Brokerage Discovery</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="free">Free Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="firecrawl">
          <FirecrawlPropertyScanner onPropertiesFound={handlePropertiesFound} />
        </TabsContent>

        <TabsContent value="brokerage">
          <AIPropertyScraper onPropertiesFound={handlePropertiesFound} />
        </TabsContent>

        <TabsContent value="comprehensive">
          <ComprehensiveScraper onPropertiesFound={handlePropertiesFound} />
        </TabsContent>

        <TabsContent value="free">
          <FreeDataSources onPropertiesFound={handlePropertiesFound} />
        </TabsContent>
      </Tabs>

      <ScrapedPropertiesDisplay key={refreshKey} />
    </div>
  );
}
