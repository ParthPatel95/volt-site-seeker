
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, RefreshCw } from 'lucide-react';

interface SubstationActionsProps {
  substationsCount: number;
  loading: boolean;
  deleting: boolean;
  onRefresh: () => void;
  onDeleteAll: () => void;
}

export function SubstationActions({ 
  substationsCount, 
  loading, 
  deleting, 
  onRefresh, 
  onDeleteAll 
}: SubstationActionsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onRefresh}
        disabled={loading}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      {substationsCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Substations</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete ALL {substationsCount} substations from the database? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
