import { Folder, MoreVertical, Trash2, Edit, FolderOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    color: string;
    description?: string | null;
    created_at: string;
    document_count?: number;
  };
  onOpen: () => void;
  onDelete: () => void;
  onRename?: () => void;
}

export function FolderCard({ folder, onOpen, onDelete, onRename }: FolderCardProps) {
  return (
    <Card
      className="group relative overflow-hidden border-watt-primary/10 hover:border-watt-primary/30 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-watt-primary/5 cursor-pointer"
      onClick={onOpen}
    >
      <div className="p-4 space-y-3">
        {/* Folder Icon with Color */}
        <div className="flex items-start justify-between">
          <div
            className="p-3 rounded-xl transition-all group-hover:scale-110"
            style={{ backgroundColor: `${folder.color}20` }}
          >
            <Folder
              className="w-8 h-8 transition-all"
              style={{ color: folder.color }}
              fill={`${folder.color}40`}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Folder Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-watt-primary transition-colors">
            {folder.name}
          </h3>
          {folder.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {folder.description}
            </p>
          )}
        </div>

        {/* Folder Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-watt-primary/10">
          <span className="flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            {folder.document_count || 0} document{folder.document_count !== 1 ? 's' : ''}
          </span>
          <span>{format(new Date(folder.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Hover Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ backgroundColor: folder.color }}
      />
    </Card>
  );
}
