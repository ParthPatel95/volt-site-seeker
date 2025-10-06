import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePdfThumbnail(storagePath: string | null, isPdf: boolean) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storagePath || !isPdf) {
      setThumbnailUrl(null);
      return;
    }

    const generateThumbnail = async () => {
      setLoading(true);
      try {
        // Get signed URL for the PDF
        const { data, error } = await supabase.functions.invoke('get-signed-url', {
          body: {
            bucket: 'secure-documents',
            path: storagePath,
            expiresIn: 3600,
          },
        });

        if (error) throw error;

        if (data?.signedUrl) {
          // For PDFs, we'll use the URL directly and let the thumbnail component handle it
          setThumbnailUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Error getting PDF URL:', error);
        setThumbnailUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [storagePath, isPdf]);

  return { thumbnailUrl, loading };
}
