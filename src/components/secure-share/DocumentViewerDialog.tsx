import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker - use HTTPS explicitly for iOS compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [useNativePdfViewer, setUseNativePdfViewer] = useState(false);
  const { toast } = useToast();
  
  // Detect iOS for native PDF viewer
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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
  const isVideo = document?.file_type?.startsWith('video/');
  const isAudio = document?.file_type?.startsWith('audio/');
  const isText = document?.file_type?.startsWith('text/');
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
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg truncate">{document?.name}</DialogTitle>
            {canDownload && documentUrl && (
              <button
                onClick={handleDownload}
                className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1.5 sm:gap-2 shrink-0 touch-manipulation"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documentUrl ? (
            <>
              {isPdf ? (
                isIOS || useNativePdfViewer ? (
                  // Native iOS PDF viewer
                  <div className="w-full h-full">
                    <object
                      data={documentUrl}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <p className="text-muted-foreground">Unable to display PDF in browser</p>
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
                    </object>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-2 sm:px-4 py-3 bg-muted/20 border-b gap-2 flex-wrap">
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={previousPage}
                          disabled={pageNumber <= 1}
                          className="h-9 px-3 sm:px-4 text-sm touch-manipulation"
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium whitespace-nowrap">
                          Page {pageNumber} of {numPages || '...'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={pageNumber >= numPages}
                          className="h-9 px-3 sm:px-4 text-sm touch-manipulation"
                        >
                          Next
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={zoomOut}
                          disabled={scale <= 0.5}
                          className="h-9 px-3 touch-manipulation"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm min-w-[60px] text-center font-medium">{Math.round(scale * 100)}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={zoomIn}
                          disabled={scale >= 3}
                          className="h-9 px-3 touch-manipulation"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="flex-1 overflow-auto flex items-start justify-center p-2 sm:p-4 bg-muted/10 overscroll-contain"
                      style={{ WebkitOverflowScrolling: 'touch' }}
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
                          if (isIOS) {
                            setUseNativePdfViewer(true);
                          } else {
                            toast({
                              title: 'Error',
                              description: 'Failed to load PDF document',
                              variant: 'destructive',
                            });
                          }
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
                )
              ) : isImage ? (
                <div 
                  className="flex items-center justify-center h-full p-4 bg-black/5"
                  onContextMenu={(e) => !canDownload && e.preventDefault()}
                >
                  <img
                    src={documentUrl}
                    alt={document?.name}
                    crossOrigin="anonymous"
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${scale})` }}
                    onContextMenu={(e) => !canDownload && e.preventDefault()}
                  />
                </div>
              ) : isVideo ? (
                <div className="flex items-center justify-center h-full p-4">
                  <video
                    src={documentUrl}
                    controls
                    playsInline
                    crossOrigin="anonymous"
                    controlsList={!canDownload ? 'nodownload' : undefined}
                    onContextMenu={(e) => !canDownload && e.preventDefault()}
                    className="max-w-full max-h-full rounded-lg"
                    style={{ transform: `scale(${scale})` }}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : isAudio ? (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-2xl">
                    <audio
                      src={documentUrl}
                      controls
                      crossOrigin="anonymous"
                      controlsList={!canDownload ? 'nodownload' : undefined}
                      onContextMenu={(e) => !canDownload && e.preventDefault()}
                      className="w-full"
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                </div>
              ) : isText ? (
                <div className="h-full w-full p-4">
                  <iframe
                    src={documentUrl}
                    sandbox="allow-same-origin"
                    className="w-full h-full bg-card rounded-lg border border-border"
                    title="Text document preview"
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