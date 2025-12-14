import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, Languages, FileText, RefreshCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayer } from './VideoPlayer';
import { OfficeDocumentViewer } from './OfficeDocumentViewer';
import { MobileTranslationPanel } from './MobileTranslationPanel';
import { useDocumentActivityTracking } from '@/hooks/useDocumentActivityTracking';

interface MobileDocumentViewerProps {
  documentUrl: string;
  documentType: string;
  accessLevel: string;
  watermarkEnabled: boolean;
  recipientEmail?: string | null;
  linkId?: string;
  documentId?: string;
  enableTracking?: boolean;
  viewerName?: string;
  viewerEmail?: string;
  documentName?: string;
  fileSizeBytes?: number;
  retryKey?: number;
}

type ViewerMode = 'loading' | 'ready' | 'error';

/**
 * MobileDocumentViewer - Canvas-based PDF.js renderer for mobile
 * 
 * Uses PDF.js to render pages onto canvas elements, which works reliably on iOS Safari
 * unlike iframes which have compatibility issues.
 */
export function MobileDocumentViewer({
  documentUrl,
  documentType,
  accessLevel,
  watermarkEnabled,
  recipientEmail,
  linkId,
  documentId,
  enableTracking = false,
  viewerName,
  viewerEmail,
  documentName = 'Document',
  fileSizeBytes,
  retryKey = 0
}: MobileDocumentViewerProps) {
  const { toast } = useToast();
  
  // Core state
  const [viewerMode, setViewerMode] = useState<ViewerMode>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  
  // Image zoom state
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState(1);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartPosition, setPanStartPosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const isMountedRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // File type detection
  const isPdf = documentType === 'application/pdf' || documentUrl?.endsWith('.pdf');
  const isImage = documentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(documentUrl || '');
  const isVideo = documentType?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(documentUrl || '');
  const isAudio = documentType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(documentUrl || '');
  const isText = documentType?.startsWith('text/') || /\.(txt|md|csv|log)$/i.test(documentUrl || '');
  const isOfficeDoc = documentType?.includes('word') || documentType?.includes('document') || /\.docx?$/i.test(documentUrl || '');
  const isOfficeSheet = documentType?.includes('sheet') || /\.xlsx?$/i.test(documentUrl || '');
  const isOfficePresentation = documentType?.includes('presentation') || /\.pptx?$/i.test(documentUrl || '');
  const isOffice = isOfficeDoc || isOfficeSheet || isOfficePresentation;

  const supportsTranslation = isPdf || isImage || isOffice || isText;
  const canDownload = accessLevel === 'download';

  // Activity tracking
  const { trackPageChange } = useDocumentActivityTracking({
    linkId: linkId || '',
    documentId: documentId || '',
    enabled: enableTracking && !!linkId && !!documentId,
    viewerName,
    viewerEmail
  });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, []);

  // Load PDF and render page using canvas
  useEffect(() => {
    if (!isPdf || !documentUrl) return;
    
    let isCancelled = false;
    
    const loadPdf = async () => {
      try {
        setViewerMode('loading');
        setErrorMessage(null);
        
        // Cleanup previous PDF
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy();
          pdfDocRef.current = null;
        }
        
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
        }
        
        console.log('[MobileDocumentViewer] Loading PDF...');
        
        const loadingTask = pdfjsLib.getDocument({
          url: documentUrl,
          withCredentials: false,
          isEvalSupported: false,
        });
        
        const pdfDoc = await loadingTask.promise;
        
        if (isCancelled) {
          pdfDoc.destroy();
          return;
        }
        
        pdfDocRef.current = pdfDoc;
        
        if (isMountedRef.current) {
          setNumPages(pdfDoc.numPages);
          setCurrentPage(1);
          console.log('[MobileDocumentViewer] PDF loaded, pages:', pdfDoc.numPages);
        }
        
      } catch (error: any) {
        console.error('[MobileDocumentViewer] PDF load error:', error);
        if (isMountedRef.current && !isCancelled) {
          setViewerMode('error');
          setErrorMessage(error.message || 'Failed to load PDF');
        }
      }
    };
    
    loadPdf();
    
    return () => {
      isCancelled = true;
    };
  }, [isPdf, documentUrl, retryKey]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current || currentPage < 1) return;
    
    let isCancelled = false;
    
    const renderPage = async () => {
      try {
        setIsRendering(true);
        
        const page = await pdfDocRef.current.getPage(currentPage);
        
        if (isCancelled) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Calculate scale to fit container width
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth - 32) / baseViewport.width; // 16px padding on each side
        const viewport = page.getViewport({ scale: Math.min(scale, 2) }); // Cap scale at 2x for performance
        
        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        if (isMountedRef.current && !isCancelled) {
          setViewerMode('ready');
          setIsRendering(false);
          trackPageChange(currentPage);
        }
        
      } catch (error: any) {
        console.error('[MobileDocumentViewer] Page render error:', error);
        if (isMountedRef.current && !isCancelled) {
          setIsRendering(false);
          // Don't set error for render failures - just leave previous content
        }
      }
    };
    
    renderPage();
    
    return () => {
      isCancelled = true;
    };
  }, [pdfDocRef.current, currentPage, trackPageChange]);

  // Page navigation
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, numPages]);

  // Touch swipe for page navigation
  const touchStartX = useRef<number | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 80; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPage < numPages) {
        // Swipe left - next page
        goToNextPage();
      } else if (diff < 0 && currentPage > 1) {
        // Swipe right - previous page
        goToPreviousPage();
      }
    }
    
    touchStartX.current = null;
  }, [currentPage, numPages, goToNextPage, goToPreviousPage]);

  // Auto-complete loading for non-PDF content
  useEffect(() => {
    if (!isPdf && !isImage) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setViewerMode('ready');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPdf, isImage]);

  // Handlers
  const handleRetry = useCallback(() => {
    setViewerMode('loading');
    setErrorMessage(null);
    setCurrentPage(1);
    window.dispatchEvent(new CustomEvent('mobile-pdf-retry'));
  }, []);

  const handleDownload = async () => {
    if (!canDownload) {
      toast({
        title: 'Download Restricted',
        description: 'This document is view-only and cannot be downloaded',
        variant: 'destructive'
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentUrl.split('/').pop()?.split('?')[0] || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: 'Your document is being downloaded'
      });
    } catch (error) {
      console.error('[MobileDocumentViewer] Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download document. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleImageLoad = useCallback(() => {
    if (isMountedRef.current) {
      setViewerMode('ready');
    }
  }, []);

  const handleImageError = useCallback(() => {
    if (isMountedRef.current) {
      setViewerMode('error');
      setErrorMessage('Failed to load image');
    }
  }, []);

  // Pinch-to-zoom handlers for images
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  }, []);

  const handleImageTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      setTouchStartDistance(distance);
      setTouchStartZoom(imageZoom);
      setIsPanning(false);
    } else if (e.touches.length === 1 && imageZoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanStartPosition({ ...imagePosition });
    }
    
    // Double-tap detection
    const now = Date.now();
    if (e.touches.length === 1 && now - lastTapTime < 300) {
      if (imageZoom > 1) {
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
      } else {
        setImageZoom(2);
      }
    }
    setLastTapTime(now);
  }, [getTouchDistance, imageZoom, imagePosition, lastTapTime]);

  const handleImageTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      if (currentDistance) {
        const scale = currentDistance / touchStartDistance;
        const newZoom = Math.max(1, Math.min(4, touchStartZoom * scale));
        setImageZoom(newZoom);
        if (newZoom <= 1) {
          setImagePosition({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && isPanning && imageZoom > 1) {
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;
      const maxPan = (imageZoom - 1) * 150;
      const newX = Math.max(-maxPan, Math.min(maxPan, panStartPosition.x + deltaX));
      const newY = Math.max(-maxPan, Math.min(maxPan, panStartPosition.y + deltaY));
      setImagePosition({ x: newX, y: newY });
    }
  }, [touchStartDistance, touchStartZoom, getTouchDistance, isPanning, imageZoom, panStart, panStartPosition]);

  const handleImageTouchEnd = useCallback(() => {
    setTouchStartDistance(null);
    setIsPanning(false);
  }, []);

  // Reset zoom when document changes
  useEffect(() => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, [documentUrl]);

  const handleZoomIn = useCallback(() => {
    setImageZoom(prev => Math.min(4, prev + 0.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(1, imageZoom - 0.5);
    setImageZoom(newZoom);
    if (newZoom <= 1) {
      setImagePosition({ x: 0, y: 0 });
    }
  }, [imageZoom]);

  const handleResetZoom = useCallback(() => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, []);

  // Error state
  if (viewerMode === 'error') {
    return (
      <div className="flex flex-col h-full w-full secure-share-viewer">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Document</h3>
            <p className="text-sm text-muted-foreground mb-4">{errorMessage || 'An error occurred'}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} variant="outline" className="touch-manipulation w-full h-12">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              {canDownload && (
                <Button onClick={handleDownload} className="touch-manipulation w-full h-12">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full secure-share-viewer">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b gap-2 flex-shrink-0">
        {/* Left: Translation button */}
        {supportsTranslation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTranslationOpen(true)}
            className="h-10 px-3 touch-manipulation"
            disabled={viewerMode === 'loading'}
          >
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </Button>
        )}
        
        {/* Center: Page navigation for PDFs */}
        {isPdf && numPages > 0 && (
          <div className="flex-1 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || isRendering}
              className="h-9 w-9 touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {currentPage} / {numPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages || isRendering}
              className="h-9 w-9 touch-manipulation"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {/* Center: Zoom controls for Images */}
        {isImage && (
          <div className="flex-1 flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={imageZoom <= 1}
              className="h-9 w-9 touch-manipulation"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={imageZoom >= 4}
              className="h-9 w-9 touch-manipulation"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            {imageZoom > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-9 px-2 text-xs touch-manipulation"
              >
                Reset
              </Button>
            )}
          </div>
        )}
        
        {!isPdf && !isImage && <div className="flex-1" />}
        
        {/* Right: Download */}
        {canDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-10 px-3 touch-manipulation"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Document Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Loading overlay */}
        {viewerMode === 'loading' && isPdf && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* Page rendering indicator removed - was causing glitchy UX */}

        {/* Watermark overlay */}
        {watermarkEnabled && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
            style={{ transform: 'rotate(-35deg)' }}
          >
            <span 
              className="text-2xl font-bold opacity-5 whitespace-nowrap select-none"
              style={{ color: 'rgba(0, 0, 0, 0.1)' }}
            >
              {recipientEmail 
                ? `Wattbyte Inc. - ${recipientEmail}` 
                : 'Wattbyte Inc. - CONFIDENTIAL'}
            </span>
          </div>
        )}

        {/* PDF Canvas Renderer */}
        {isPdf && (
          <div 
            className="w-full min-h-full flex items-start justify-center p-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas 
              ref={canvasRef}
              className="max-w-full shadow-lg bg-white"
              style={{ touchAction: 'pan-y' }}
            />
          </div>
        )}

        {/* Images with Pinch-to-Zoom */}
        {isImage && (
          <div 
            ref={imageContainerRef}
            className="w-full h-full overflow-hidden flex items-center justify-center touch-manipulation"
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
            style={{ touchAction: imageZoom > 1 ? 'none' : 'pan-y' }}
          >
            <img
              src={documentUrl}
              alt="Document"
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
              style={{ 
                transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {imageZoom > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium z-20 pointer-events-none">
                {Math.round(imageZoom * 100)}%
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {isVideo && (
          <div className="w-full h-full">
            <VideoPlayer
              src={documentUrl}
              canDownload={canDownload}
              onError={() => {
                if (isMountedRef.current) {
                  setViewerMode('error');
                  setErrorMessage('Failed to load video');
                }
              }}
            />
          </div>
        )}

        {/* Audio */}
        {isAudio && (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-4">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Audio File</p>
              </div>
              <audio
                src={documentUrl}
                controls
                className="w-full"
                onCanPlay={() => {
                  if (isMountedRef.current) {
                    setViewerMode('ready');
                  }
                }}
                onError={() => {
                  if (isMountedRef.current) {
                    setViewerMode('error');
                    setErrorMessage('Failed to load audio');
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Text files */}
        {isText && (
          <div className="w-full h-full overflow-auto p-4">
            <TextFileViewer 
              url={documentUrl} 
              onLoad={() => {
                if (isMountedRef.current) {
                  setViewerMode('ready');
                }
              }}
              onError={() => {
                if (isMountedRef.current) {
                  setViewerMode('error');
                  setErrorMessage('Failed to load text file');
                }
              }}
            />
          </div>
        )}

        {/* Office documents */}
        {isOffice && (
          <OfficeDocumentViewer
            documentUrl={documentUrl}
            documentType={documentType}
          />
        )}
      </div>

      {/* Mobile Translation Panel (Bottom Sheet) */}
      <MobileTranslationPanel
        isOpen={translationOpen}
        onClose={() => setTranslationOpen(false)}
        documentUrl={documentUrl}
        documentId={documentId}
        documentType={documentType}
        numPages={numPages}
        fileSizeBytes={fileSizeBytes}
      />
    </div>
  );
}

// Simple text file viewer component
function TextFileViewer({ 
  url, 
  onLoad, 
  onError 
}: { 
  url: string; 
  onLoad: () => void; 
  onError: () => void;
}) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();
    
    fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load');
        return response.text();
      })
      .then(text => {
        if (isMountedRef.current) {
          setContent(text);
          setLoading(false);
          onLoad();
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('[TextFileViewer] Error:', err);
        if (isMountedRef.current) {
          setLoading(false);
          onError();
        }
      });
      
    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [url, onLoad, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-4 rounded-lg">
      {content}
    </pre>
  );
}
