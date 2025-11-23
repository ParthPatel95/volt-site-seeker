import { useState } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function NaturalLanguageQueryPanel() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setResponse(`Based on your query "${query}", here are the key insights: Companies in the renewable energy sector are showing strong growth potential with average power consumption increasing by 15% year-over-year. Key investment opportunities include solar infrastructure and energy storage solutions.`);
      setLoading(false);
    }, 2000);
  };

  const exampleQueries = [
    "Which companies have the highest power consumption growth?",
    "Show me distressed companies in the manufacturing sector",
    "What are the investment opportunities in renewable energy?"
  ];

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="Natural Language Query"
        icon={MessageSquare}
        priority="high"
        loading={loading}
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Ask a question about your data
            </label>
            <Textarea
              placeholder="e.g., Which companies in Texas have the highest power consumption?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={isMobile ? 3 : 4}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleQuery} 
            disabled={loading || !query.trim()}
            className="w-full"
            size={isMobile ? "default" : "lg"}
          >
            {loading ? (
              <>
                <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask Question
              </>
            )}
          </Button>

          {response && (
            <EnhancedCard
              title="AI Response"
              icon={Sparkles}
              priority="medium"
              className="bg-accent/50 border-primary/20"
            >
              <p className="text-sm text-foreground leading-relaxed">{response}</p>
            </EnhancedCard>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center text-foreground">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Example Queries
            </h4>
            <div className="space-y-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-left text-sm text-primary hover:text-primary/80 block w-full p-3 rounded-lg hover:bg-accent transition-colors border border-border"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
}
