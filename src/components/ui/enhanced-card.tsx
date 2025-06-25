
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedCardProps {
  title: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  priority?: 'low' | 'medium' | 'high';
  loading?: boolean;
}

export function EnhancedCard({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
  headerActions,
  priority = 'medium',
  loading = false
}: EnhancedCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isMobile = useIsMobile();

  const priorityStyles = {
    low: 'border-slate-200 bg-slate-50/50',
    medium: 'border-slate-300 bg-white',
    high: 'border-blue-200 bg-blue-50/30 shadow-sm'
  };

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      priorityStyles[priority],
      isMobile && "mx-1 mb-4",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isMobile ? "p-4 pb-2" : "p-6 pb-4",
        collapsible && "cursor-pointer"
      )} onClick={handleToggle}>
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {Icon && (
            <Icon className={cn(
              "flex-shrink-0",
              isMobile ? "w-5 h-5" : "w-6 h-6",
              priority === 'high' ? "text-blue-600" : "text-muted-foreground"
            )} />
          )}
          <CardTitle className={cn(
            "truncate",
            isMobile ? "text-lg" : "text-xl font-semibold"
          )}>
            {title}
          </CardTitle>
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {headerActions}
          {collapsible && (
            <Button variant="ghost" size="sm" className="p-1">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className={cn(
          "transition-all duration-300",
          isMobile ? "p-4 pt-0" : "p-6 pt-0"
        )}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
