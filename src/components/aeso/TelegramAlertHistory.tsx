import React from 'react';
import { useTelegramAlerts, ALERT_TYPE_INFO } from '@/hooks/useTelegramAlerts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface TelegramAlertHistoryProps {
  settingId: string;
}

export function TelegramAlertHistory({ settingId }: TelegramAlertHistoryProps) {
  const { useAlertHistory, useRulesForSetting } = useTelegramAlerts();
  const { data: history, isLoading } = useAlertHistory(settingId, 50);
  const { data: rules } = useRulesForSetting(settingId);

  const getRuleInfo = (ruleId: string) => {
    const rule = rules?.find(r => r.id === ruleId);
    if (!rule) return { icon: '📊', label: 'Unknown' };
    return ALERT_TYPE_INFO[rule.alert_type] || { icon: '📊', label: rule.alert_type };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No alerts sent yet</p>
        <p className="text-xs mt-1">Alerts will appear here when triggered</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 pr-4">
        {history.map((item) => {
          const ruleInfo = getRuleInfo(item.rule_id);
          
          return (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {/* Status Icon */}
              <div className="mt-0.5">
                {item.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{ruleInfo.icon}</span>
                  <span className="text-sm font-medium">{ruleInfo.label}</span>
                  <Badge 
                    variant={item.success ? 'default' : 'destructive'} 
                    className="text-xs h-5"
                  >
                    {item.success ? 'Sent' : 'Failed'}
                  </Badge>
                </div>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className="text-xs text-muted-foreground line-clamp-2 cursor-pointer hover:text-foreground">
                      {item.message.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Full Message</h4>
                      <p className="text-xs whitespace-pre-wrap">
                        {item.message.replace(/<[^>]*>/g, '')}
                      </p>
                      {item.trigger_data?.marketData && (
                        <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                          <p>Pool Price: ${item.trigger_data.marketData.poolPrice?.toFixed(2)}/MWh</p>
                          <p>Reserve Margin: {item.trigger_data.marketData.reserveMargin?.toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>

                {item.error_message && (
                  <p className="text-xs text-destructive mt-1">
                    Error: {item.error_message}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.sent_at), { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {format(new Date(item.sent_at), 'PPpp')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
