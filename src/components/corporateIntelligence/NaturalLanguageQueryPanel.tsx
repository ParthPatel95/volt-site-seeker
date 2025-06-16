
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';

export function NaturalLanguageQueryPanel() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Natural Language Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ask a question about your data</label>
            <Textarea
              placeholder="e.g., Which companies in Texas have the highest power consumption?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleQuery} 
            disabled={loading || !query.trim()}
            className="w-full"
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
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">AI Response</h4>
                <p className="text-sm text-gray-700">{response}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h4 className="font-medium mb-2">Example Queries</h4>
            <div className="space-y-1">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-left text-sm text-blue-600 hover:text-blue-800 block w-full p-2 rounded hover:bg-blue-50"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
