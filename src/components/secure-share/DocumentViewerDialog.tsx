import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './viewer/VideoPlayer';
import { PdfErrorBoundary } from './viewer/PdfErrorBoundary';
import { OfficeDocumentViewer } from './viewer/OfficeDocumentViewer';

// Configure PDF.js worker - use import.meta.url for Vite bundling (most reliable)
const initializePdfWorker = () => {
  try {
    // Primary: Use import.meta.url for Vite bundling - this bundles the worker locally
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    console.log('[PDF.js Dialog] Worker initialized via import.meta.url');
  } catch (e) {
    // Fallback: CDN for environments where import.meta.url doesn't work
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    console.log('[PDF.js Dialog] Worker initialized via CDN fallback');
  }
};

initializePdfWorker();

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
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadErrorCountRef = useRef(0);
  const { toast } = useToast();
  
  // Detect iOS for native PDF viewer
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Memoize Document options to prevent re-renders - CRITICAL: withCredentials false for CORS
  const documentOptions = useMemo(() => ({
    disableRange: false,
    disableStream: false,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    withCredentials: false,  // Critical for CORS with Supabase signed URLs
    isEvalSupported: false,  // Security - disable eval in PDF.js
  }), []);

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

  // File type detection - handle empty/missing file_type gracefully
  const fileType = document?.file_type || '';
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf' || document?.name?.toLowerCase().endsWith('.pdf');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isText = fileType.startsWith('text/');
  const isOfficeDoc = fileType.includes('word') || fileType.includes('document') || /\.docx?$/i.test(document?.name || '');
  const isOfficeSheet = fileType.includes('sheet') || /\.xlsx?$/i.test(document?.name || '');
  const isOfficePresentation = fileType.includes('presentation') || /\.pptx?$/i.test(document?.name || '');
  const isOffice = isOfficeDoc || isOfficeSheet || isOfficePresentation;
  const canDownload = accessLevel === 'download';

  // Reset state when dialog opens/closes or document changes
  useEffect(() => {
    if (open && document) {
      // Reset all state for new document
      setDocumentUrl(null);
      setNumPages(0);
      setPageNumber(1);
      setUseNativePdfViewer(false);
      setDocumentLoaded(false);
      loadErrorCountRef.current = 0;
      loadDocument();
    } else {
      setDocumentUrl(null);
      setNumPages(0);
      setPageNumber(1);
      setDocumentLoaded(false);
    }
  }, [open, document]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  // Safety timeout: Falls back to native viewer if PDF doesn't load
  useEffect(() => {
    if (open && isPdf && !useNativePdfViewer && !documentLoaded && documentUrl) {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const timeoutDuration = isMobileDevice ? 20000 : 12000; // 20s mobile, 12s desktop
      
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn('[DocumentDialog] Safety timeout - falling back to native viewer');
        setUseNativePdfViewer(true);
        toast({
          title: 'Loading Timeout',
          description: 'Switched to browser PDF viewer for better performance.',
        });
      }, timeoutDuration);
      
      return () => {
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
      };
    }
  }, [open, isPdf, useNativePdfViewer, documentLoaded, documentUrl, toast]);

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
          setLoading(false);
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
    console.log('[DocumentDialog] PDF loaded successfully, pages:', pdf.numPages);
    setNumPages(pdf.numPages);
    setDocumentLoaded(true);
    loadErrorCountRef.current = 0; // Reset error count on success
    
    // Clear safety timeout since document loaded
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[DocumentDialog] PDF load error:', error);
    loadErrorCountRef.current += 1;
    
    if (loadErrorCountRef.current >= 3) {
      console.log('[DocumentDialog] Too many errors, falling back to native viewer');
      setUseNativePdfViewer(true);
    }
  };

  const handlePdfErrorBoundaryError = () => {
    console.log('[DocumentDialog] PdfErrorBoundary triggered native fallback');
    setUseNativePdfViewer(true);
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

  // Render PDF content (used in error boundary)
  const renderPdfContent = () => (
    <Document
      file={documentUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onDocumentLoadError}
      loading={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
      options={documentOptions}
    >
      <Page
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={false}
        renderAnnotationLayer={true}
        className="shadow-lg mx-auto"
        loading={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }
      />
    </Document>
  );

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
                  // Native PDF viewer with navigation info
                  <div className="w-full h-full relative">
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
                        console.error('PDF iframe error:', e);
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
                      <PdfErrorBoundary 
                        onError={handlePdfErrorBoundaryError}
                        maxRetries={3}
                        resetKey={documentUrl}
                      >
                        {renderPdfContent()}
                      </PdfErrorBoundary>
                    </div>
                  </div>
                )
              ) : isOffice ? (
                // Office document preview
                <OfficeDocumentViewer
                  documentUrl={documentUrl}
                  documentType={fileType}
                  canDownload={canDownload}
                  onDownload={handleDownload}
                />
              ) : isImage ? (
                <div className="flex items-center justify-center h-full p-4 overflow-auto">
                  <img
                    src={documentUrl}
                    alt={document?.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ userSelect: 'none' }}
                    draggable={false}
                  />
                </div>
              ) : isVideo ? (
                <div className="flex items-center justify-center h-full p-4">
                  <VideoPlayer
                    src={documentUrl}
                    canDownload={canDownload}
                    className="max-w-full max-h-full"
                    fileName={document?.name}
                  />
                </div>
              ) : isAudio ? (
                <div className="flex items-center justify-center h-full p-4">
                  <audio 
                    src={documentUrl} 
                    controls 
                    className="w-full max-w-md"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : isText ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border-0"
                  title={document?.name}
                />
              ) : (
                // Unknown file type - show download option
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <AlertCircle className="w-16 h-16 text-muted-foreground" />
                  <p className="text-lg font-medium">Preview not available</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    This file type cannot be previewed. {canDownload ? 'Please download to view.' : ''}
                  </p>
                  {canDownload && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No document to display</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
