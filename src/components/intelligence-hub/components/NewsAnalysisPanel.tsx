
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink, Calendar } from 'lucide-react';

interface NewsAnalysisPanelProps {
  analysisResult: any;
}

export function NewsAnalysisPanel({ analysisResult }: NewsAnalysisPanelProps) {
  const news = analysisResult?.news || analysisResult?.newsArticles || [];
  const sentiment = analysisResult?.newsSentiment || analysisResult?.sentiment;

  if (news.length === 0 && !sentiment) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No News Data Available</p>
        <p className="text-sm">Recent news and sentiment will appear here when available</p>
      </div>
    );
  }

  const getSentimentBadge = (sentimentValue: string | number) => {
    if (typeof sentimentValue === 'number') {
      if (sentimentValue > 0.3) return { label: 'Positive', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: TrendingUp };
      if (sentimentValue < -0.3) return { label: 'Negative', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: TrendingDown };
      return { label: 'Neutral', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: Minus };
    }
    
    const sentiment = String(sentimentValue).toLowerCase();
    if (sentiment.includes('positive') || sentiment.includes('bullish')) {
      return { label: 'Positive', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: TrendingUp };
    }
    if (sentiment.includes('negative') || sentiment.includes('bearish')) {
      return { label: 'Negative', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: TrendingDown };
    }
    return { label: 'Neutral', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: Minus };
  };

  return (
    <div className="space-y-4">
      {/* Overall Sentiment */}
      {sentiment && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Overall News Sentiment</p>
                <p className="text-xs text-muted-foreground">Based on {news.length || 'recent'} articles</p>
              </div>
              <Badge variant="outline" className={getSentimentBadge(sentiment.overall || sentiment).color}>
                {React.createElement(getSentimentBadge(sentiment.overall || sentiment).icon, { className: 'w-3 h-3 mr-1' })}
                {getSentimentBadge(sentiment.overall || sentiment).label}
              </Badge>
            </div>
            
            {sentiment.breakdown && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 bg-green-500/10 rounded">
                  <p className="text-lg font-bold text-green-600">{sentiment.breakdown.positive || 0}%</p>
                  <p className="text-xs text-muted-foreground">Positive</p>
                </div>
                <div className="text-center p-2 bg-gray-500/10 rounded">
                  <p className="text-lg font-bold text-gray-600">{sentiment.breakdown.neutral || 0}%</p>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
                <div className="text-center p-2 bg-red-500/10 rounded">
                  <p className="text-lg font-bold text-red-600">{sentiment.breakdown.negative || 0}%</p>
                  <p className="text-xs text-muted-foreground">Negative</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* News Articles */}
      {news.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Recent News</p>
          {news.slice(0, 6).map((article: any, i: number) => {
            const articleSentiment = getSentimentBadge(article.sentiment || 'neutral');
            
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">{article.title || article.headline}</h4>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.summary}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${articleSentiment.color}`}>
                          {articleSentiment.label}
                        </Badge>
                        {article.source && (
                          <span className="text-xs text-muted-foreground">{article.source}</span>
                        )}
                        {article.date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(article.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {article.url && (
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
