
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export function SocialSentimentPanel() {
  const sentimentData = [
    {
      platform: 'Twitter',
      sentiment: 'positive',
      score: 72,
      mentions: 1247,
      keywords: ['growth', 'innovation', 'expansion']
    },
    {
      platform: 'LinkedIn',
      sentiment: 'neutral',
      score: 58,
      mentions: 834,
      keywords: ['hiring', 'partnership', 'development']
    },
    {
      platform: 'Reddit',
      sentiment: 'negative',
      score: 34,
      mentions: 456,
      keywords: ['concerns', 'delays', 'issues']
    }
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500';
      case 'negative':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Social Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.map((data, index) => (
              <Card key={index} className={`border-l-4 ${getSentimentColor(data.sentiment)}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{data.platform}</h4>
                      {getSentimentIcon(data.sentiment)}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {data.sentiment}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Sentiment Score</span>
                      <div className="font-bold">{data.score}/100</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Mentions</span>
                      <div className="font-bold">{data.mentions.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Key Topics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
