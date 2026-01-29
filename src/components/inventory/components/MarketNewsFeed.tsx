import React, { useState } from 'react';
import { Newspaper, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
}

interface MarketNewsFeedProps {
  news: NewsArticle[];
  isLoading?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export function MarketNewsFeed({
  news,
  isLoading = false,
  className,
  defaultOpen = false,
}: MarketNewsFeedProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isLoading) {
    return (
      <Card className={cn("border-border/60", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/60", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-primary" />
                Market News
                <span className="text-xs font-normal text-muted-foreground">
                  ({news.length} articles)
                </span>
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {news.map((article, index) => (
              <article 
                key={index}
                className="group border-b border-border/40 last:border-0 pb-3 last:pb-0"
              >
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-1 hover:opacity-80 transition-opacity"
                >
                  <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  {article.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </article>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
