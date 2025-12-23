import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedUrl, cacheUrl } from '@/utils/signedUrlCache';

interface UseVideoSignedUrlOptions {
  storagePath: string;
  bucket?: string;
  expiresIn?: number;
}

interface UseVideoSignedUrlReturn {
  signedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fetchUrl: () => Promise<string | null>;
}

/**
 * Hook for lazy-loading video signed URLs with caching
 * Only fetches URL when explicitly called (on user interaction)
 */
export function useVideoSignedUrl({
  storagePath,
  bucket = 'secure-documents',
  expiresIn = 21600, // 6 hours for videos
}: UseVideoSignedUrlOptions): UseVideoSignedUrlReturn {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    // Check cache first
    const cached = getCachedUrl(storagePath, true);
    if (cached) {
      console.log('[useVideoSignedUrl] Cache hit for:', storagePath);
      setSignedUrl(cached);
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useVideoSignedUrl] Fetching signed URL for:', storagePath);
      
      const { data, error: fnError } = await supabase.functions.invoke('get-signed-url', {
        body: {
          bucket,
          storagePath,
          expiresIn,
          isVideo: true,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get signed URL');
      }

      if (data?.signedUrl) {
        // Cache the URL
        cacheUrl(storagePath, data.signedUrl, expiresIn, true);
        setSignedUrl(data.signedUrl);
        console.log('[useVideoSignedUrl] URL fetched and cached');
        return data.signedUrl;
      }

      throw new Error('No signed URL returned');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load video';
      console.error('[useVideoSignedUrl] Error:', message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storagePath, bucket, expiresIn]);

  return {
    signedUrl,
    isLoading,
    error,
    fetchUrl,
  };
}
