import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Workspace {
  id: string;
  name: string;
}

interface InventoryMobileHeaderProps {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  onWorkspaceChange: (id: string) => void;
  onCreateWorkspace: () => void;
  onSettings: () => void;
  scannerActive?: boolean;
}

export function InventoryMobileHeader({
  workspaces,
  selectedWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  onSettings,
  scannerActive,
}: InventoryMobileHeaderProps) {
  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      {/* Workspace Selector */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Select value={selectedWorkspaceId || ''} onValueChange={onWorkspaceChange}>
          <SelectTrigger className="h-10 flex-1 max-w-[200px] bg-background border-border">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <SelectValue placeholder="Select workspace">
                {selectedWorkspace?.name}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {workspaces.map(ws => (
              <SelectItem key={ws.id} value={ws.id} className="py-2.5">
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 flex-shrink-0"
          onClick={onCreateWorkspace}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Scanner status indicator */}
        {scannerActive !== undefined && (
          <div className={cn(
            "w-2.5 h-2.5 rounded-full flex-shrink-0",
            scannerActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
          )} />
        )}

        {/* Settings button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          onClick={onSettings}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
