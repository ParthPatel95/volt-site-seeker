
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Search, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  published_at: string;
  keywords: string[];
  url?: string;
  discovered_at: string;
}

export function NewsIntelligencePanel() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadNewsArticles();
  }, []);

  const loadNewsArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_intelligence')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNewsArticles(data || []);
    } catch (error) {
      console.error('Error loading news articles:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeNews = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze news",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'analyze_news_intelligence', 
          company_name: companyName.trim() 
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "News Analysis Complete",
          description: `Analyzed ${data.articles_analyzed} news articles for ${companyName}`,
        });
        loadNewsArticles();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error analyzing news:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze news intelligence",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            News Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered news analysis for corporate intelligence
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze Company News</CardTitle>
          <CardDescription>
            Generate AI-powered news intelligence for any company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeNews()}
            />
            <Button onClick={analyzeNews} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze News'}
              <Search className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading news articles...</p>
        </div>
      ) : newsArticles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No News Articles Found
            </h3>
            <p className="text-muted-foreground">
              Analyze a company to generate news intelligence
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {newsArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{article.source}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {article.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {article.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {article.keywords?.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
