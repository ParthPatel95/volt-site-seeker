
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Search, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  published_at: string;
  url?: string;
  keywords: string[];
  discovered_at: string;
}

export function NewsIntelligencePanel() {
  const [companyName, setCompanyName] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeNews = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze news",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: {
          action: 'analyze_news_intelligence',
          company_name: companyName.trim()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setNews(data.news || []);
        toast({
          title: "News Analysis Complete",
          description: `Found ${data.total_articles || 0} recent articles about ${companyName}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to analyze news');
      }
    } catch (error: any) {
      console.error('Error analyzing news:', error);
      toast({
        title: "News Analysis Error",
        description: error.message || "Failed to analyze news. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Newspaper className="w-5 h-5 mr-2" />
            News Intelligence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && analyzeNews()}
              className="flex-1"
            />
            <Button 
              onClick={analyzeNews} 
              disabled={loading || !companyName.trim()}
            >
              {loading ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze News
                </>
              )}
            </Button>
          </div>

          {news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent News Articles</h3>
                <Badge variant="secondary" className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {news.length} articles found
                </Badge>
              </div>

              <div className="grid gap-4">
                {news.map((article) => (
                  <Card key={article.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg line-clamp-2">{article.title}</h4>
                        {article.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {article.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {article.keywords?.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-medium">{article.source}</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(article.published_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
