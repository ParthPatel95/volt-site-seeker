
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialIntelligence {
  id: string;
  platform: string;
  source: string;
  content: string;
  author: string;
  posted_at: string;
  sentiment_score: number;
  sentiment_analysis: any;
  early_warning_signals: string[];
  keywords: string[];
  discovered_at: string;
}

export function SocialSentimentPanel() {
  const [socialData, setSocialData] = useState<SocialIntelligence[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_intelligence')
        .select('*')
        .order('discovered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSocialData(data || []);
    } catch (error) {
      console.error('Error loading social intelligence:', error);
      toast({
        title: "Error",
        description: "Failed to load social intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startMonitoring = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to monitor social sentiment",
        variant: "destructive"
      });
      return;
    }

    setMonitoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'monitor_social_sentiment',
          company_name: companyName.trim()
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Social Monitoring Started",
          description: `Started monitoring social sentiment for ${companyName}`,
        });
        loadSocialData();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error starting monitoring:', error);
      toast({
        title: "Monitoring Error",
        description: error.message || "Failed to start social sentiment monitoring",
        variant: "destructive"
      });
    } finally {
      setMonitoring(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 20) return 'default';
    if (score > -20) return 'secondary';
    return 'destructive';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 20) return <TrendingUp className="w-4 h-4" />;
    if (score > -20) return <MessageCircle className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const chartData = socialData
    .filter(item => item.sentiment_score !== null)
    .slice(0, 20)
    .map(item => ({
      date: new Date(item.posted_at).toLocaleDateString(),
      sentiment: item.sentiment_score,
      platform: item.platform
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Social Sentiment Analysis
          </h2>
          <p className="text-muted-foreground">
            Real-time social media monitoring and sentiment analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Social Sentiment</CardTitle>
          <CardDescription>
            Track social media sentiment and early warning signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && startMonitoring()}
            />
            <Button onClick={startMonitoring} disabled={monitoring}>
              {monitoring ? 'Starting...' : 'Start Monitoring'}
              <MessageCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>
              Social sentiment over time across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-100, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Sentiment Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading social intelligence...</p>
        </div>
      ) : socialData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Social Data Found
            </h3>
            <p className="text-muted-foreground">
              Start monitoring a company to see social sentiment analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {socialData.slice(0, 20).map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getSentimentIcon(item.sentiment_score)}
                      {item.platform} - {item.source}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getSentimentColor(item.sentiment_score)}>
                        Sentiment: {item.sentiment_score || 'N/A'}
                      </Badge>
                      <Badge variant="outline">
                        {new Date(item.posted_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.content.substring(0, 200)}...
                </p>

                {item.early_warning_signals && item.early_warning_signals.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium mb-2 flex items-center gap-1 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      Early Warning Signals
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {item.early_warning_signals.map((signal, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
