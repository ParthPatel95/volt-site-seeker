import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ExternalLink, Download } from 'lucide-react';
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
  accessLevel?: 'view_only' | 'download';
}

export function DocumentViewerDialog({ open, onOpenChange, document, accessLevel = 'view_only' }: DocumentViewerDialogProps) {
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
  const canDownload = accessLevel === 'download';

  const handleDownload = async () => {
    if (!canDownload || !documentUrl || !document) return;
    
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: 'Your document is being downloaded',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{document?.name}</DialogTitle>
            {canDownload && documentUrl && (
              <button
                onClick={handleDownload}
                className="text-sm text-primary hover:underline inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documentUrl ? (
            <>
              {isPdf ? (
                <iframe
                  src={`${documentUrl}#toolbar=${canDownload ? '1' : '0'}`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  title="Document Viewer"
                  sandbox={canDownload ? "allow-same-origin allow-scripts allow-downloads" : "allow-same-origin allow-scripts"}
                  onContextMenu={(e) => !canDownload && e.preventDefault()}
                />
              ) : isImage ? (
                <div 
                  className="flex items-center justify-center h-full p-4 bg-black/5"
                  onContextMenu={(e) => !canDownload && e.preventDefault()}
                >
                  <img
                    src={documentUrl}
                    alt={document?.name}
                    className="max-w-full max-h-full object-contain"
                    onContextMenu={(e) => !canDownload && e.preventDefault()}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  {canDownload && (
                    <button
                      onClick={handleDownload}
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      Download to view
                      <Download className="w-4 h-4" />
                    </button>
                  )}
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
