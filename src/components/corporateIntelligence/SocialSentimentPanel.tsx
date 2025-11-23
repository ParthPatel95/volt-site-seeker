import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, ThumbsDown, Minus, Hash } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function SocialSentimentPanel() {
  const isMobile = useIsMobile();
  
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
        return <ThumbsDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentBorder = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-500';
      case 'negative':
        return 'border-l-destructive';
      default:
        return 'border-l-muted';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50/50 dark:bg-green-950/20';
      case 'negative':
        return 'bg-destructive/10';
      default:
        return 'bg-muted/30';
    }
  };

  const getSentimentVariant = (sentiment: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (sentiment) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <EnhancedCard
        title="Social Sentiment Analysis"
        icon={MessageCircle}
        priority="high"
        collapsible={isMobile}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {sentimentData.map((data, index) => (
            <EnhancedCard
              key={index}
              title={data.platform}
              icon={MessageCircle}
              priority="medium"
              className={`border-l-4 ${getSentimentBorder(data.sentiment)} ${getSentimentBg(data.sentiment)}`}
              headerActions={
                <div className="flex items-center gap-2">
                  {getSentimentIcon(data.sentiment)}
                  <Badge variant={getSentimentVariant(data.sentiment)} className="capitalize text-xs">
                    {data.sentiment}
                  </Badge>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Metrics Grid */}
                <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-4'}`}>
                  <div className="p-3 rounded-md bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Sentiment Score</span>
                    <div className="font-bold text-xl text-foreground">{data.score}/100</div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Mentions</span>
                    <div className="font-bold text-xl text-foreground">{data.mentions.toLocaleString()}</div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    Key Topics
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.keywords.map((keyword, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs"
                      >
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
      </EnhancedCard>
    </div>
  );
}
