import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';
import { queueUpload, getPendingCount } from '@/utils/offlineUploadQueue';

interface UploadResult {
  url: string;
  path: string;
}

type UploadStage = 'idle' | 'compressing' | 'uploading' | 'retrying' | 'queued';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 7000];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB may not be available
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const uploadImage = async (
    file: File | Blob,
    folder?: string
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setStage('compressing');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be logged in to upload images');
      }

      // Layer 1: Compress image
      let uploadBlob: Blob = file;
      try {
        const compressed = await compressImage(file);
        uploadBlob = compressed.blob;
      } catch {
        console.warn('Image compression failed, using original');
      }

      setProgress(20);
      setStage('uploading');

      // Check if offline
      if (!navigator.onLine) {
        await queueUpload(uploadBlob, folder);
        await refreshPendingCount();
        setStage('queued');
        toast.success('Image saved locally — will upload when back online', { icon: '📱' });
        return null;
      }

      const timestamp = Date.now();
      const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
      const filePath = folder
        ? `${user.id}/${folder}/${fileName}`
        : `${user.id}/${fileName}`;

      // Layer 2: Retry with backoff
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          setStage('retrying');
          setRetryAttempt(attempt + 1);
          toast.info(`Poor connection, retrying upload... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await delay(RETRY_DELAYS[attempt - 1]);
        }

        setProgress(20 + (attempt * 20));

        try {
          const { data, error } = await supabase.storage
            .from('inventory-images')
            .upload(filePath, uploadBlob, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            lastError = error as unknown as Error;
            continue;
          }

          setProgress(90);
          const { data: { publicUrl } } = supabase.storage
            .from('inventory-images')
            .getPublicUrl(data.path);

          setProgress(100);
          setStage('idle');
          return { url: publicUrl, path: data.path };
        } catch (err) {
          lastError = err as Error;
        }
      }

      // Layer 3: Queue offline
      await queueUpload(uploadBlob, folder);
      await refreshPendingCount();
      setStage('queued');
      toast.success('Image saved locally — will upload when back online', { icon: '📱' });
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
      setRetryAttempt(0);
      setTimeout(() => setStage('idle'), 1500);
    }
  };

  const uploadFromBlob = async (
    blob: Blob,
    folder?: string
  ): Promise<UploadResult | null> => {
    return uploadImage(blob, folder);
  };

  const uploadFromDataUrl = async (
    dataUrl: string,
    folder?: string
  ): Promise<UploadResult | null> => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return uploadImage(blob, folder);
    } catch (error) {
      console.error('Error converting data URL:', error);
      toast.error('Failed to process image');
      return null;
    }
  };

  const deleteImage = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('inventory-images')
        .remove([path]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
      return false;
    }
  };

  return {
    uploadImage,
    uploadFromBlob,
    uploadFromDataUrl,
    deleteImage,
    isUploading,
    progress,
    stage,
    retryAttempt,
    pendingCount,
  };
}
