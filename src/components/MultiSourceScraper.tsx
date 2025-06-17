
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIPropertyScraper } from './scraping/AIPropertyScraper';
import { ComprehensiveScraper } from './scraping/ComprehensiveScraper';
import { ScrapedPropertiesDisplay } from './scraping/ScrapedPropertiesDisplay';
import { supabase } from '@/integrations/supabase/client';
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

  // Load initial count
  useEffect(() => {
    const loadPropertyCount = async () => {
      const { data, error } = await supabase
        .from('scraped_properties')
        .select('id', { count: 'exact' });
      
      if (!error && data) {
        setScrapedPropertiesCount(data.length);
      }
    };

    loadPropertyCount();

    // Set up real-time subscription for count updates
    const subscription = supabase
      .channel('scraped_properties_count')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scraped_properties' },
        () => {
          loadPropertyCount(); // Reload count when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePropertiesFound = (count: number) => {
    setScrapedPropertiesCount(prev => prev + count);
  };

  return (
    <div className="h-screen overflow-y-auto bg-background p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Source Property Scraper</h1>
          <p className="text-muted-foreground">
            Web scraping tools for real estate discovery
          </p>
        </div>
      </div>

      <Tabs defaultValue="comprehensive-scraper" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comprehensive-scraper" className="flex items-center">
            <Bot className="w-4 h-4 mr-2" />
            Comprehensive Scraper
          </TabsTrigger>
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

        <TabsContent value="comprehensive-scraper" className="space-y-6">
          <ComprehensiveScraper onPropertiesFound={handlePropertiesFound} />
          
          {/* Technical Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Multi-Site Scraping</h3>
                <p className="text-sm text-green-600">30+ major brokerage sites</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Smart Parsing</h3>
                <p className="text-sm text-blue-600">Dynamic content extraction</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">Anti-Bot Handling</h3>
                <p className="text-sm text-purple-600">User-agent rotation & delays</p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <Database className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800">Data Normalization</h3>
                <p className="text-sm text-orange-600">Structured property data</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-scraper" className="space-y-6">
          <AIPropertyScraper onPropertiesFound={handlePropertiesFound} />
          
          {/* AI Features Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Real Data Sources</h3>
                <p className="text-sm text-blue-600">Live market data integration</p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Multi-Platform</h3>
                <p className="text-sm text-green-600">Google, LoopNet, Crexi & more</p>
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
                <h3 className="font-semibold text-orange-800">Real-Time</h3>
                <p className="text-sm text-orange-600">Live property discovery</p>
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
