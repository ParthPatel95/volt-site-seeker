import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './viewer/VideoPlayer';

// Configure PDF.js worker with multiple fallbacks for pdfjs-dist 5.x compatibility
const workerUrls = [
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`,
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`,
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`,
  // Legacy fallbacks for older environments
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
];

// Try each worker URL with proper async error handling
let workerInitialized = false;
for (const url of workerUrls) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = url;
    workerInitialized = true;
    console.log(`[PDF.js Dialog] Worker initialized: ${url}`);
    break;
  } catch (error) {
    console.warn(`[PDF.js Dialog] Failed: ${url}`, error);
  }
}

if (!workerInitialized) {
  console.error('[PDF.js Dialog] All PDF.js worker CDNs failed');
}

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
  const [pdfDocumentProxy, setPdfDocumentProxy] = useState<any>(null);
  const [pageLoadTimeout, setPageLoadTimeout] = useState(false);
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

  const isImage = document?.file_type?.startsWith('image/');
  const isPdf = document?.file_type === 'application/pdf';
  const isVideo = document?.file_type?.startsWith('video/');
  const isAudio = document?.file_type?.startsWith('audio/');
  const isText = document?.file_type?.startsWith('text/');
  const canDownload = accessLevel === 'download';

  // Pre-fetch PDF page count for iOS navigation
  useEffect(() => {
    if (open && document && isPdf && documentUrl) {
      const loadPdfMetadata = async () => {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
          }
          
          const loadingTask = pdfjsLib.getDocument({
            url: documentUrl,
            withCredentials: false,
            isEvalSupported: false,
            disableRange: false,
            disableStream: false,
          });
          
          const proxy = await loadingTask.promise;
          setNumPages(proxy.numPages);
          console.log('[DocumentDialog] PDF metadata loaded', { numPages: proxy.numPages });
        } catch (error) {
          console.error('[DocumentDialog] Failed to load PDF metadata:', error);
        }
      };
      
      loadPdfMetadata();
    }
  }, [open, document, isPdf, documentUrl]);

  // Width locking mechanism refs
  const widthLocked = useRef(false);
  const lockedPageWidth = useRef<number | null>(null);

  useEffect(() => {
    if (open && document) {
      // Reset width lock when document changes
      widthLocked.current = false;
      lockedPageWidth.current = null;
      loadDocument();
    } else {
      setDocumentUrl(null);
      setNumPages(0);
      setPageNumber(1);
      // Reset state when dialog closes
      widthLocked.current = false;
      lockedPageWidth.current = null;
    }
  }, [open, document]);

  const loadDocument = async () => {
    if (!document) return;

    setLoading(true);
    let lastError: any;
    
    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[DocumentDialog] Loading document (attempt ${attempt}):`, document.storage_path);
        
        const { data, error } = await supabase.functions.invoke('get-signed-url', {
          body: {
            bucket: 'secure-documents',
            path: document.storage_path,
            expiresIn: 3600,
          },
        });

        if (error) {
          console.error('[DocumentDialog] Edge function error:', error);
          lastError = error;
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw error;
        }

        if (data?.signedUrl) {
          console.log('[DocumentDialog] Got signed URL');
          setDocumentUrl(data.signedUrl);
          return; // Success!
        } else {
          throw new Error('No signed URL returned');
        }
      } catch (error: any) {
        lastError = error;
        if (attempt < 3) {
          console.log(`[DocumentDialog] Retry ${attempt}/3 after error:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // All retries failed
    console.error('[DocumentDialog] All attempts failed:', lastError);
    toast({
      title: 'Error',
      description: lastError?.message || 'Failed to load document. Please try again.',
      variant: 'destructive',
    });
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!canDownload || !documentUrl || !document) return;
    
    try {
      // iOS/Safari-specific download handling
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isSafari || isIOS) {
        // Safari/iOS: Use direct navigation
        console.log('Using Safari/iOS download method');
        window.location.href = documentUrl;
      } else {
        // Modern browsers: Use fetch + blob
        console.log('Using fetch+blob download method');
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
      }

      toast({
        title: 'Download Started',
        description: 'Your document is being downloaded',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const onDocumentLoadSuccess = (pdf: any) => {
    // Prevent race condition - only set if not already set by pre-load effect
    if (numPages === 0) {
      setNumPages(pdf.numPages);
    }
    if (pageNumber === 0 || pageNumber === 1) {
      setPageNumber(1);
    }
    if (!pdfDocumentProxy) {
      setPdfDocumentProxy(pdf);
    }
  };
  
  // Loading timeout fallback - only on initial load (not page changes)
  useEffect(() => {
    if (open && isPdf && !useNativePdfViewer && !isIOS && numPages === 0) {
      const timeout = setTimeout(() => {
        console.warn('[DocumentDialog] Initial load timeout - falling back to native viewer');
        setPageLoadTimeout(true);
        setUseNativePdfViewer(true);
        toast({
          title: 'Loading Timeout',
          description: 'Switched to browser PDF viewer for better performance.',
        });
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [open, isPdf, useNativePdfViewer, isIOS, numPages, toast]);

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
                  // Native iOS PDF viewer with navigation info
                  <div className="w-full h-full relative">
                    {/* iOS Navigation Info Bar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {numPages > 0 ? `${numPages} pages` : 'Loading...'}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Scroll to navigate
                      </span>
                    </div>
                    
                    <iframe
                      src={documentUrl}
                      className="w-full h-full border-0"
                      title={document?.name}
                      onError={(e) => {
                        console.error('iOS PDF iframe error:', e);
                        toast({
                          title: 'PDF Loading Error',
                          description: 'Unable to display PDF. Please try downloading the file.',
                          variant: 'destructive',
                        });
                      }}
                    />
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
                          aria-label="Previous page"
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
                          aria-label="Next page"
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
                      style={{ overscrollBehavior: 'contain' }}
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
                        options={{
                          // Enable progressive loading for faster first page render
                          disableRange: false,
                          disableStream: false,
                          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                          cMapPacked: true,
                        }}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                          console.error('[DocumentDialog] PDF load error:', error);
                          // Fallback to native/browser PDF viewer on ANY error
                          setUseNativePdfViewer(true);
                          toast({
                            title: 'PDF Loading Issue',
                            description: 'Switching to browser PDF viewer for better compatibility.',
                          });
                        }}
                        loading={
                          <div className="w-full max-w-[800px] mx-auto p-4 animate-pulse">
                            <div className="bg-muted rounded-lg aspect-[8.5/11] w-full flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading document...</p>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pageNumber}
                          scale={scale}
                          renderTextLayer={false}
                          renderAnnotationLayer={true}
                          onContextMenu={(e) => !canDownload && e.preventDefault()}
                          error={
                            <div className="text-center p-8 bg-destructive/10 rounded-lg">
                              <p className="text-destructive mb-4">Failed to load page {pageNumber}</p>
                              <Button 
                                onClick={() => setUseNativePdfViewer(true)} 
                                size="sm"
                                variant="outline"
                              >
                                Switch to Browser Viewer
                              </Button>
                            </div>
                          }
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
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${scale})` }}
                    onContextMenu={(e) => !canDownload && e.preventDefault()}
                  />
                </div>
              ) : isVideo ? (
                <div className="flex items-center justify-center h-full p-4">
                  <VideoPlayer
                    src={documentUrl}
                    canDownload={canDownload}
                    className="max-w-full max-h-full"
                    onError={(error) => {
                      console.error('[DocumentDialog] Video error:', error);
                      toast({
                        title: 'Video Error',
                        description: 'Failed to load video. Please try again or download the file.',
                        variant: 'destructive'
                      });
                    }}
                  />
                </div>
              ) : isAudio ? (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full max-w-2xl">
                    <audio
                      src={documentUrl}
                      controls
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