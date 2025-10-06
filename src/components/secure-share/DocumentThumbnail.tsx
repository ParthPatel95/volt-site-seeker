import { FileText, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentThumbnailProps {
  fileUrl: string;
  fileType: string;
  storagePath: string;
}

export function DocumentThumbnail({ fileUrl, fileType, storagePath }: DocumentThumbnailProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');

  useEffect(() => {
    if (isPdf) {
      loadPdfPreview();
    }
  }, [isPdf, storagePath]);

  const loadPdfPreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-signed-url', {
        body: {
          bucket: 'secure-documents',
          path: storagePath,
          expiresIn: 3600,
        },
      });

      if (error) throw error;
      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error loading PDF preview:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // For images, show the actual image
  if (isImage && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt="Document preview"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // For PDFs, show iframe preview of first page
  if (isPdf && previewUrl) {
    return (
      <div className="absolute inset-0 bg-white">
        <iframe
          src={`${previewUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`}
          className="w-full h-full pointer-events-none scale-[0.95] origin-top-left"
          title="PDF preview"
          style={{ border: 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Loading state
  if (loading && isPdf) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
      </div>
    );
  }

  // For PDFs and other documents, show an icon
  const Icon = isPdf ? FileText : File;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <Icon className="w-24 h-24 text-primary/40" />
      {isPdf && (
        <span className="text-xs text-muted-foreground mt-2 font-medium">PDF</span>
      )}
    </div>
  );
}
