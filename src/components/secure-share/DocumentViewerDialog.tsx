import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const { toast } = useToast();

  // Add annotation layer styles for clickable links (based on official PDF.js styles)
  useEffect(() => {
    const style = window.document.createElement('style');
    style.innerHTML = `
      .react-pdf__Page {
        position: relative;
      }
      
      .react-pdf__Page__annotations.annotationLayer {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        transform-origin: 0 0;
      }
      
      .react-pdf__Page__annotations.annotationLayer section {
        position: absolute;
        text-align: initial;
        pointer-events: auto;
        box-sizing: border-box;
        transform-origin: 0 0;
      }
      
      .react-pdf__Page__annotations.annotationLayer :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton) > a {
        position: absolute;
        font-size: 1em;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
      
      .react-pdf__Page__annotations.annotationLayer :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton):not(.hasBorder) > a:hover {
        opacity: 0.2;
        background-color: rgb(255 255 0);
      }
      
      .react-pdf__Page__annotations.annotationLayer .linkAnnotation.hasBorder:hover {
        background-color: rgb(255 255 0 / 0.2);
      }
    `;
    window.document.head.appendChild(style);
    
    return () => {
      window.document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (open && document) {
      loadDocument();
    } else {
      setDocumentUrl(null);
      setNumPages(0);
      setPageNumber(1);
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

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
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {pageNumber} of {numPages || '...'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={scale >= 3}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/10"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      const link = target.closest('a[href]') as HTMLAnchorElement;
                      if (link && link.href) {
                        e.preventDefault();
                        window.open(link.href, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <Document
                      file={documentUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => {
                        console.error('Error loading PDF:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to load PDF document',
                          variant: 'destructive',
                        });
                      }}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={true}
                        onContextMenu={(e) => !canDownload && e.preventDefault()}
                      />
                    </Document>
                  </div>
                </div>
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