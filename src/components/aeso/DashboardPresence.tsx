import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';
import { useDashboardCollaboration } from '@/hooks/useDashboardCollaboration';

interface DashboardPresenceProps {
  dashboardId: string;
}

export function DashboardPresence({ dashboardId }: DashboardPresenceProps) {
  const { activeUsers } = useDashboardCollaboration(dashboardId);

  const getInitials = (email?: string) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (email?: string) => {
    if (!email) return 'Anonymous';
    return email.split('@')[0];
  };

  if (activeUsers.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center -space-x-2">
          {activeUsers.slice(0, 3).map((user, index) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {getInitials(user.user_email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{getDisplayName(user.user_email)}</p>
                <p className="text-xs text-muted-foreground">Currently viewing</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {activeUsers.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="w-8 h-8 border-2 border-background bg-muted">
                  <AvatarFallback className="text-xs">
                    +{activeUsers.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{activeUsers.length - 3} more online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <Badge variant="secondary" className="text-xs">
          <Users className="w-3 h-3 mr-1" />
          {activeUsers.length} online
        </Badge>
      </div>
    </TooltipProvider>
  );
}
