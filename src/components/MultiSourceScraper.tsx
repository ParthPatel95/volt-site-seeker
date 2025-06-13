
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIPropertyScraper } from './scraping/AIPropertyScraper';
import { ScrapedPropertiesDisplay } from './scraping/ScrapedPropertiesDisplay';
import { 
  Brain, 
  Search, 
  Database, 
  Globe,
  Bot,
  Zap
} from 'lucide-react';

export function MultiSourceScraper() {
  const [scrapedPropertiesCount, setScrapedPropertiesCount] = useState(0);

  const handlePropertiesFound = (count: number) => {
    setScrapedPropertiesCount(prev => prev + count);
  };

  return (
    <div className="h-screen overflow-y-auto bg-background p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Source Property Scraper</h1>
          <p className="text-muted-foreground">
            AI-powered property discovery and intelligent data collection across multiple sources
          </p>
        </div>
      </div>

      <Tabs defaultValue="ai-scraper" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-scraper" className="flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Property Scraper
          </TabsTrigger>
          <TabsTrigger value="scraped-properties">
            Scraped Properties ({scrapedPropertiesCount})
          </TabsTrigger>
          <TabsTrigger value="source-management">
            Source Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-scraper" className="space-y-6">
          <AIPropertyScraper onPropertiesFound={handlePropertiesFound} />
          
          {/* AI Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">AI Analysis</h3>
                <p className="text-sm text-blue-600">GPT-4o powered property discovery</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Smart Search</h3>
                <p className="text-sm text-green-600">Location & criteria based filtering</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">Power Focus</h3>
                <p className="text-sm text-purple-600">Infrastructure & capacity analysis</p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Auto Processing</h3>
                <p className="text-sm text-orange-600">Intelligent data extraction</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scraped-properties">
          <ScrapedPropertiesDisplay />
        </TabsContent>

        <TabsContent value="source-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Source Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">Source Management</h3>
                <p className="text-muted-foreground">
                  Configure and manage scraping sources. This feature will be enhanced in future updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
