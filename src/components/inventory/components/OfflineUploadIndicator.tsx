import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudOff, Cloud, Loader2, Check } from 'lucide-react';
import { getPendingCount, getPendingUploads, removePendingUpload } from '@/utils/offlineUploadQueue';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OfflineUploadIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB may not be available
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isSyncing) return;
    const pending = await getPendingUploads();
    if (pending.length === 0) return;

    setIsSyncing(true);
    setSyncedCount(0);
    let successCount = 0;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSyncing(false);
      return;
    }

    for (const item of pending) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = item.folder
          ? `${user.id}/${item.folder}/${fileName}`
          : `${user.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('inventory-images')
          .upload(filePath, item.imageBlob, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!error) {
          await removePendingUpload(item.id);
          successCount++;
          setSyncedCount(successCount);
        }
      } catch {
        // Skip failed items, they'll retry next time
      }
    }

    setIsSyncing(false);
    await refreshCount();

    if (successCount > 0) {
      toast.success(`${successCount} photo${successCount > 1 ? 's' : ''} synced successfully`);
    }
  }, [isSyncing, refreshCount]);

  // Poll for pending count
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 5000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processQueue]);

  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 h-8",
        isSyncing && "animate-pulse"
      )}
      onClick={processQueue}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span className="text-xs">Syncing {syncedCount}/{pendingCount + syncedCount}...</span>
        </>
      ) : (
        <>
          <CloudOff className="w-3.5 h-3.5 text-data-warning" />
          <span className="text-xs">{pendingCount} pending</span>
        </>
      )}
    </Button>
  );
}
