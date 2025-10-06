import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    name: string;
    storage_path: string;
    file_type: string;
  } | null;
}

export function DocumentViewerDialog({ open, onOpenChange, document }: DocumentViewerDialogProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && document) {
      loadDocument();
    } else {
      setDocumentUrl(null);
    }
  }, [open, document]);

  const loadDocument = async () => {
    if (!document) return;

    setLoading(true);
    try {
      console.log('Loading document:', document.storage_path);
      
      const { data, error } = await supabase.functions.invoke('get-signed-url', {
        body: {
          bucket: 'secure-documents',
          path: document.storage_path,
          expiresIn: 3600,
        },
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.signedUrl) {
        console.log('Got signed URL:', data.signedUrl);
        setDocumentUrl(data.signedUrl);
      } else {
        throw new Error('No signed URL returned');
      }
    } catch (error: any) {
      console.error('Error loading document:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load document preview',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isImage = document?.file_type?.startsWith('image/');
  const isPdf = document?.file_type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{document?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded-lg border bg-muted/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documentUrl ? (
            <>
              {isPdf ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full"
                  title={document?.name}
                />
              ) : isImage ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={documentUrl}
                    alt={document?.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  <a
                    href={documentUrl}
                    download={document?.name}
                    className="text-primary hover:underline"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
