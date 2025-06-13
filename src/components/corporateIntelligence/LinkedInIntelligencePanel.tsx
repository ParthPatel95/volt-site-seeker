
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MessageSquare, 
  Calendar,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LinkedInData {
  id: string;
  company: string;
  content: string;
  post_date: string;
  keywords: string[];
  signals: string[];
  discovered_at: string;
}

export function LinkedInIntelligencePanel() {
  const [linkedinData, setLinkedinData] = useState<LinkedInData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLinkedInData();
  }, []);

  const loadLinkedInData = async () => {
    setLoading(true);
    try {
      console.log('Loading LinkedIn intelligence data...');
      
      const { data, error } = await supabase
        .from('linkedin_intelligence')
        .select('*')
        .order('discovered_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading LinkedIn data:', error);
        toast({
          title: "Error Loading LinkedIn Data",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const transformedData: LinkedInData[] = (data || []).map((row) => ({
        id: row.id,
        company: row.company,
        content: row.content,
        post_date: row.post_date,
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        signals: Array.isArray(row.signals) ? row.signals : [],
        discovered_at: row.discovered_at
      }));

      setLinkedinData(transformedData);
      console.log('LinkedIn data loaded:', transformedData.length, 'records');

    } catch (error) {
      console.error('Error loading LinkedIn data:', error);
      toast({
        title: "Error",
        description: "Failed to load LinkedIn intelligence data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes('closure') || signal.includes('distress')) return 'bg-red-500';
    if (signal.includes('restructuring') || signal.includes('change')) return 'bg-orange-500';
    if (signal.includes('asset') || signal.includes('sale')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            LinkedIn Intelligence ({linkedinData.length} posts)
          </div>
          <Button variant="outline" size="sm" onClick={loadLinkedInData} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading LinkedIn intelligence...</p>
          </div>
        ) : linkedinData.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No LinkedIn Data Found</h3>
            <p className="text-muted-foreground">Run LinkedIn monitoring to see corporate posts and signals here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {linkedinData.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-700">{post.company}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(post.post_date)}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-700 line-clamp-3">{post.content}</p>
                  </div>
                  
                  {post.keywords.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {post.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {post.signals.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Signals:</span>
                      <div className="flex flex-wrap gap-1">
                        {post.signals.map((signal, idx) => (
                          <Badge key={idx} className={`${getSignalColor(signal)} text-white text-xs`}>
                            {signal.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Discovered: {formatDate(post.discovered_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
