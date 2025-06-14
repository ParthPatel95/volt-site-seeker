
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueryResult {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  confidence: number;
  sources: string[];
}

export function NaturalLanguageQueryPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a query to search",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'natural_language_query',
          query: query.trim()
        },
      });

      if (error) throw error;

      if (data?.success) {
        const newResult: QueryResult = {
          id: Date.now().toString(),
          query: query.trim(),
          response: data.response,
          timestamp: new Date().toISOString(),
          confidence: data.confidence || 85,
          sources: data.sources || []
        };
        
        setResults(prev => [newResult, ...prev]);
        setQuery('');
        
        toast({
          title: "Query Complete",
          description: "Found relevant information for your query",
        });
      }
    } catch (error: any) {
      console.error('Error processing query:', error);
      toast({
        title: "Query Error",
        description: error.message || "Failed to process natural language query",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Which companies in our portfolio have the highest power consumption?",
    "Show me companies with recent distress signals in the manufacturing sector",
    "What are the ESG scores for companies with power infrastructure opportunities?",
    "Find companies with supply chain risks in Asia",
    "Which investment opportunities have the best timing scores?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Natural Language Query
          </h2>
          <p className="text-muted-foreground">
            Ask questions about your corporate intelligence data in plain English
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask Your Question</CardTitle>
          <CardDescription>
            Query your corporate intelligence database using natural language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Ask me anything about your corporate intelligence data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitQuery()}
              className="flex-1"
            />
            <Button onClick={submitQuery} disabled={loading}>
              {loading ? 'Processing...' : 'Ask'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Example queries:</h4>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Queries Yet
            </h3>
            <p className="text-muted-foreground">
              Ask your first question to see AI-powered insights from your data
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{result.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Confidence: {result.confidence}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3">{result.response}</p>
                    
                    {result.sources && result.sources.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium mb-1">Sources:</h4>
                        <div className="flex flex-wrap gap-1">
                          {result.sources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
