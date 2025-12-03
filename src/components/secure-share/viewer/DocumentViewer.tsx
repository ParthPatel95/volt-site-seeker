import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Maximize2, Minimize2, MoreVertical, Globe, Languages, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentActivityTracking } from '@/hooks/useDocumentActivityTracking';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { VideoPlayer } from './VideoPlayer';
import { TranslationPanel } from './TranslationPanel';
import { extractPageText } from '@/utils/pdfTextExtractor';
import { OfficeDocumentViewer } from './OfficeDocumentViewer';

// Configure PDF.js worker - use import.meta.url for Vite bundling (most reliable)
const initializePdfWorker = () => {
  try {
    // Primary: Use import.meta.url for Vite bundling - this bundles the worker locally
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    console.log('[PDF.js] Worker initialized via import.meta.url');
  } catch (e) {
    // Fallback: CDN for environments where import.meta.url doesn't work
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    console.log('[PDF.js] Worker initialized via CDN fallback');
  }
};

initializePdfWorker();

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface DocumentViewerProps {
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
}

export function DocumentViewer({
  documentUrl,
  documentType,
  accessLevel,
  watermarkEnabled,
  recipientEmail,
  linkId,
  documentId,
  enableTracking = false,
  viewerName,
  viewerEmail
}: DocumentViewerProps) {
  const { toast } = useToast();
  const [downloadAttempted, setDownloadAttempted] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [rotation, setRotation] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfPageDimensions, setPdfPageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  // Start with react-pdf viewer on ALL devices - fall back to native only on actual errors
  // This allows translation feature to work (requires react-pdf for text extraction)
  const [useNativePdfViewer, setUseNativePdfViewer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserZooming, setIsUserZooming] = useState(false);
  const initialDimensionsSet = useRef(false);
  const [pageLoadTimeout, setPageLoadTimeout] = useState(false);
  const initialLoadRef = useRef(true);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  
  // Ref for container (simplified - no manual canvas cleanup needed with scale-based rendering)
  
  // Translation state
  const [translationOpen, setTranslationOpen] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfDocumentProxy, setPdfDocumentProxy] = useState<any>(null);
  const [isLoadingPdfProxy, setIsLoadingPdfProxy] = useState(false);
  
  // Touch gesture state
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState<number>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
  // Navigation debouncing
  const isNavigating = useRef(false);
  const lastNavigationTime = useRef(0);
  
  // Detect iOS for native PDF viewer fallback
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Detect mobile on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isPdf = documentType === 'application/pdf' || documentUrl.endsWith('.pdf');
  const isImage = documentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(documentUrl);
  const isVideo = documentType?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(documentUrl);
  const isAudio = documentType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(documentUrl);
  const isText = documentType?.startsWith('text/') || /\.(txt|md|csv|log)$/i.test(documentUrl);
  const isOfficeDoc = documentType?.includes('word') || documentType?.includes('document') || /\.docx?$/i.test(documentUrl);
  const isOfficeSheet = documentType?.includes('sheet') || /\.xlsx?$/i.test(documentUrl);
  const isOfficePresentation = documentType?.includes('presentation') || /\.pptx?$/i.test(documentUrl);
  const isOffice = isOfficeDoc || isOfficeSheet || isOfficePresentation;
  
  // Extract file size from URL query params if available (added by ViewDocument)
  const urlParams = new URLSearchParams(documentUrl.split('?')[1] || '');
  const fileSizeParam = urlParams.get('fileSize');
  const fileSize = fileSizeParam ? parseInt(fileSizeParam, 10) : undefined;
  
  // PDFs, images, Office documents, and text files support translation
  const supportsTranslation = isPdf || isImage || isOffice || isText;

  // Cleanup PDF.js resources on unmount
  useEffect(() => {
    return () => {
      if (pdfjs.GlobalWorkerOptions.workerSrc) {
        console.log('[PDF.js] Cleaning up resources');
      }
    };
  }, []);

  // Reset state when document URL changes
  useEffect(() => {
    console.log('[DocumentViewer] Document URL changed, resetting state');
    setNumPages(0);
    setPageNumber(1);
    // Start with react-pdf - fall back to native only on actual errors
    setUseNativePdfViewer(false);
    setPageLoadTimeout(false);
    setDocumentLoaded(false);
    setPdfDocumentProxy(null);
    setPdfPageDimensions(null);
    initialDimensionsSet.current = false;
    initialLoadRef.current = true;
  }, [documentUrl]);

  // Pre-load PDF proxy for text extraction AND page count (critical for iOS navigation)
  useEffect(() => {
    if (isPdf && documentUrl) {
      
      const loadPdfProxy = async () => {
        setIsLoadingPdfProxy(true);
        console.log('[DocumentViewer] Pre-loading PDF proxy for text extraction and page count');
        try {
          const pdfjsLib = await import('pdfjs-dist');
          
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            const workerUrls = [
              `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
              `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
            ];
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
            console.log('[DocumentViewer] PDF.js worker configured:', workerUrls[0]);
          }
          
          const loadingTask = pdfjsLib.getDocument({
            url: documentUrl,
            withCredentials: false,
            isEvalSupported: false,
            // Enable progressive loading for faster first page
            disableRange: false,
            disableStream: false,
          });
          
          const proxy = await loadingTask.promise;
          setPdfDocumentProxy(proxy);
          // Set numPages immediately (critical for iOS to show navigation controls)
          setNumPages(proxy.numPages);
          
          // Get PDF dimensions for initial page load
          proxy.getPage(1).then((page: any) => {
            const viewport = page.getViewport({ scale: 1 });
            setPdfPageDimensions({ width: viewport.width, height: viewport.height });
            console.log('[DocumentViewer] PDF page dimensions loaded', viewport.width, viewport.height);
          });
          
          console.log('[DocumentViewer] PDF proxy loaded successfully', { numPages: proxy.numPages });
        } catch (error) {
          console.error('[DocumentViewer] Failed to load PDF proxy:', error);
          // Don't fallback immediately - let react-pdf try to load the document
          // Only fallback if react-pdf also fails
        } finally {
          setIsLoadingPdfProxy(false);
        }
      };
      
      loadPdfProxy();
    }
  }, [isPdf, documentUrl]);
  
  // Safety timeout: Uses documentLoaded state to fix race condition (not numPages)
  useEffect(() => {
    if (isPdf && !useNativePdfViewer && !documentLoaded && initialLoadRef.current) {
      const timeout = setTimeout(() => {
        console.warn('[DocumentViewer] Initial load timeout - falling back to native viewer');
        setPageLoadTimeout(true);
        setUseNativePdfViewer(true);
        initialLoadRef.current = false;
        toast({
          title: 'Loading Timeout',
          description: 'Switched to browser PDF viewer for better performance.',
        });
      }, 12000); // 12 second timeout for initial load only
      
      return () => clearTimeout(timeout);
    }
  }, [isPdf, useNativePdfViewer, documentLoaded, toast]);

  // Activity tracking
  const { trackPageChange, trackScrollDepth } = useDocumentActivityTracking({
    linkId: linkId || '',
    documentId: documentId || '',
    enabled: enableTracking && !!linkId && !!documentId,
    viewerName,
    viewerEmail
  });

  const canDownload = accessLevel === 'download';

  const handleDownload = async () => {
    if (!canDownload) {
      toast({
        title: 'Download Restricted',
        description: 'This document is view-only and cannot be downloaded',
        variant: 'destructive'
      });
      return;
    }

    setDownloadAttempted(true);
    
    try {
      // Extract filename from URL
      let filename = documentUrl.split('/').pop()?.split('?')[0] || 'document';
      filename = decodeURIComponent(filename);
      
      // Browser-specific download handling
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isSafari || isIOS) {
        // Safari/iOS: Use direct link navigation (more reliable for signed URLs)
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Modern browsers: Fetch and create blob
        const response = await fetch(documentUrl);
        if (!response.ok) throw new Error('Download failed');
        
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: documentType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Download Started',
        description: 'Your document is being downloaded'
      });
    } catch (error) {
      console.error('[Download] Error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download document. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Disable right-click and keyboard shortcuts for view-only
  useEffect(() => {
    if (canDownload) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: 'Action Restricted',
        description: 'Right-click is disabled for view-only documents',
        variant: 'destructive'
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl/Cmd + P (print), Ctrl/Cmd + S (save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        toast({
          title: 'Action Restricted',
          description: 'This action is disabled for view-only documents',
          variant: 'destructive'
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canDownload, toast]);

  // Watermark overlay and annotation layer styles
  useEffect(() => {
    const style = document.createElement('style');
    
    let styles = '';
    
    // Watermark styles
    if (watermarkEnabled) {
      const watermarkText = recipientEmail 
        ? `Wattbyte Inc. - ${recipientEmail}` 
        : 'Wattbyte Inc. - CONFIDENTIAL';
      styles += `
        .watermark-overlay {
          position: relative;
          overflow: hidden;
        }
        .watermark-overlay::before {
          content: "${watermarkText}";
          position: absolute;
          inset: 8%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-35deg);
          font-size: clamp(1.25rem, 3vw, 2.5rem);
          font-weight: 700;
          color: rgba(0, 0, 0, 0.06);
          pointer-events: none;
          z-index: 10;
          text-align: center;
          white-space: normal;
          user-select: none;
        }
      `;
    }
    
    // Annotation layer styles for clickable links (based on official PDF.js styles)
    styles += `
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
    
    style.innerHTML = styles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [watermarkEnabled, recipientEmail]);

  // Extract text when translation is opened
  useEffect(() => {
    if (translationOpen && documentUrl) {
      if (isPdf) {
        // PDF text extraction
        setIsExtracting(true);
        extractPageText(documentUrl, pageNumber)
          .then((text) => {
            setExtractedText(text);
            if (!text || text.trim().length < 10) {
              console.warn('[DocumentViewer] Very little text extracted - PDF may be scanned/image-based');
            }
          })
          .catch((error) => {
            console.error('[DocumentViewer] PDF text extraction failed:', error);
            setExtractedText('');
            toast({
              title: 'Extraction Error',
              description: 'Failed to extract text from PDF. The document may be password-protected, scanned, or image-based.',
              variant: 'destructive'
            });
          })
          .finally(() => {
            setIsExtracting(false);
          });
      } else if (isImage) {
        // For images, we'll use OCR directly - no text to extract
        setExtractedText('');
        setIsExtracting(false);
        console.log('[DocumentViewer] Image document - OCR will be used for translation');
      } else if (isText) {
        // For text files, fetch the content directly
        setIsExtracting(true);
        fetch(documentUrl)
          .then(response => response.text())
          .then(text => {
            setExtractedText(text);
            console.log('[DocumentViewer] Text file content loaded', { length: text.length });
          })
          .catch((error) => {
            console.error('[DocumentViewer] Text file loading failed:', error);
            setExtractedText('');
            toast({
              title: 'Loading Error',
              description: 'Failed to load text file content.',
              variant: 'destructive'
            });
          })
          .finally(() => {
            setIsExtracting(false);
          });
      } else if (isOffice) {
        // Office documents - no pre-extraction, will use parser on demand
        setExtractedText('');
        setIsExtracting(false);
        console.log('[DocumentViewer] Office document - parser will be used for translation');
      }
    }
  }, [translationOpen, pageNumber, documentUrl, isPdf, isImage, isText, isOffice, toast]);
  
  // Build PDF URL - hide toolbar for view-only
  const pdfUrl = isPdf && !canDownload
    ? `${documentUrl}#toolbar=0`
    : documentUrl;

  const handleZoomIn = () => {
    setIsUserZooming(true);
    setZoom(prev => Math.min(prev + 0.25, 3.0));
    setTimeout(() => setIsUserZooming(false), 300);
  };
  
  const handleZoomOut = () => {
    setIsUserZooming(true);
    setZoom(prev => Math.max(prev - 0.25, 0.5));
    setTimeout(() => setIsUserZooming(false), 300);
  };
  
  const handleResetZoom = () => {
    setIsUserZooming(true);
    setZoom(1.0);
    setTimeout(() => setIsUserZooming(false), 300);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Debounced page change handler to prevent rapid fire navigation
  const handlePageChange = useCallback((newPage: number) => {
    const now = Date.now();
    // Debounce: minimum 150ms between navigations
    if (now - lastNavigationTime.current < 150) return;
    if (newPage < 1 || newPage > numPages || newPage === pageNumber) return;
    
    lastNavigationTime.current = now;
    setPageNumber(newPage);
  }, [numPages, pageNumber]);
  
  const toggleFullscreen = () => {
    // Feature detection for Fullscreen API
    const fullscreenEnabled = document.fullscreenEnabled || 
      (document as any).webkitFullscreenEnabled || 
      (document as any).mozFullScreenEnabled || 
      (document as any).msFullscreenEnabled;
    
    if (!fullscreenEnabled) {
      toast({
        title: 'Fullscreen Not Supported',
        description: 'Your browser does not support fullscreen mode',
        variant: 'destructive'
      });
      return;
    }
    
    const docElement = document.documentElement;
    
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const requestFullscreen = docElement.requestFullscreen || 
        (docElement as any).webkitRequestFullscreen || 
        (docElement as any).mozRequestFullScreen || 
        (docElement as any).msRequestFullscreen;
      
      if (requestFullscreen) {
        requestFullscreen.call(docElement);
        setIsFullscreen(true);
      }
    } else {
      const exitFullscreen = document.exitFullscreen || 
        (document as any).webkitExitFullscreen || 
        (document as any).mozCancelFullScreen || 
        (document as any).msExitFullscreen;
      
      if (exitFullscreen) {
        exitFullscreen.call(document);
        setIsFullscreen(false);
      }
    }
  };
  
  // Touch gesture handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getTouchDistance(e.touches);
      setTouchStartDistance(distance);
      setTouchStartZoom(zoom);
    } else if (e.touches.length === 1 && !isIOS && !useNativePdfViewer) {
      // Swipe for page navigation (ONLY when react-pdf is active)
      setTouchStartX(e.touches[0].clientX);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance) {
      // Pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      if (currentDistance) {
        const scale = currentDistance / touchStartDistance;
        const newZoom = Math.max(0.5, Math.min(3.0, touchStartZoom * scale));
        setZoom(newZoom);
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Disable swipe navigation for iOS or native viewer (they ignore React state)
    if (touchStartX !== null && e.changedTouches.length === 1 && !isIOS && !useNativePdfViewer) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // Swipe threshold
      if (Math.abs(diff) > 50) {
        if (diff > 0 && pageNumber < numPages) {
          // Swipe left - next page
          setPageNumber(prev => prev + 1);
        } else if (diff < 0 && pageNumber > 1) {
          // Swipe right - previous page
          setPageNumber(prev => prev - 1);
        }
      }
    }
    
    setTouchStartDistance(null);
    setTouchStartX(null);
  };

  function onDocumentLoadSuccess(pdf: any) {
    console.log('[DocumentViewer] PDF loaded successfully', { numPages: pdf.numPages });
    
    // Mark document as loaded - fixes timeout race condition
    setDocumentLoaded(true);
    
    // Prevent race condition - only set if not already set by pre-load effect
    if (numPages === 0) {
      setNumPages(pdf.numPages);
    }
    // Don't reset pageNumber if already navigating
    if (pageNumber === 0 || pageNumber === 1) {
      setPageNumber(1);
    }
    // Only set proxy if not already loaded
    if (!pdfDocumentProxy) {
      setPdfDocumentProxy(pdf);
    }
  }

  const handlePageLoadSuccess = useCallback((page: any) => {
    // Only set dimensions once per document to prevent render loops
    if (initialDimensionsSet.current) return;
    
    const { width, height } = page;
    setPdfPageDimensions({ width, height });
    initialDimensionsSet.current = true;
  }, []);

  // Track page changes
  useEffect(() => {
    if (enableTracking && linkId && documentId) {
      trackPageChange(pageNumber);
    }
  }, [pageNumber, enableTracking, linkId, documentId]);

  // Track scroll depth
  useEffect(() => {
    if (!enableTracking || !linkId || !documentId) return;

    const handleScroll = () => {
      const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (!scrollArea) return;

      const scrollTop = scrollArea.scrollTop;
      const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
      const scrollPercentage = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      trackScrollDepth(scrollPercentage);
    };

    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    scrollArea?.addEventListener('scroll', handleScroll);

    return () => {
      scrollArea?.removeEventListener('scroll', handleScroll);
    };
  }, [enableTracking, linkId, documentId, trackScrollDepth]);


  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Progress bar for mobile */}
      {isMobile && isPdf && numPages > 0 && (
        <div className="h-1 bg-muted shrink-0">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(pageNumber / numPages) * 100}%` }}
          />
        </div>
      )}
      
      <div className={`bg-card flex-1 flex flex-col ${watermarkEnabled ? 'watermark-overlay' : ''}`}>
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center justify-between p-3 md:p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {isPdf && numPages > 0 && (
              <>
                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={() => handlePageChange(pageNumber - 1)} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={pageNumber <= 1}
                    title="Previous Page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                    {pageNumber} / {numPages}
                  </span>
                  <Button 
                    onClick={() => handlePageChange(pageNumber + 1)} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={pageNumber >= numPages}
                    title="Next Page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border-l border-border pl-2 md:pl-4">
                  <Button 
                    onClick={handleZoomOut} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={zoom <= 0.5}
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handleResetZoom} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2 text-xs min-w-[60px]"
                  >
                    {Math.round(zoom * 100)}%
                  </Button>
                  <Button 
                    onClick={handleZoomIn} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={zoom >= 3.0}
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Rotate */}
                <Button 
                  onClick={handleRotate} 
                  size="sm" 
                  variant="ghost"
                  className="h-7 md:h-8 px-2"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {supportsTranslation && (
              <Button 
                onClick={() => setTranslationOpen(!translationOpen)} 
                size="sm" 
                variant="outline"
                className="text-xs md:text-sm"
                title="Translate Document"
              >
                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Translate</span>
              </Button>
            )}
            {canDownload && (
              <Button onClick={handleDownload} size="sm" className="text-xs md:text-sm">
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            <Button onClick={toggleFullscreen} size="sm" variant="outline">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Controls */}
        <div className="flex md:hidden items-center justify-between p-2 border-b border-border shrink-0">
          <span className="text-sm font-medium">
            {isPdf && numPages > 0 ? `${pageNumber} / ${numPages}` : 'Document'}
          </span>
          <div className="flex items-center gap-1">
            {isPdf && (
              <>
                <Button onClick={handleZoomOut} size="icon" variant="ghost" className="h-8 w-8" disabled={zoom <= 0.5}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomIn} size="icon" variant="ghost" className="h-8 w-8" disabled={zoom >= 3.0}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
            {supportsTranslation && (
              <Button 
                onClick={() => setTranslationOpen(!translationOpen)} 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8"
                title="Translate"
              >
                <Globe className="w-4 h-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isPdf && (
                  <>
                    <DropdownMenuItem onClick={handleRotate}>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleResetZoom}>
                      Reset Zoom
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
                {canDownload && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Document Display */}
        <ScrollArea className="flex-1 overscroll-contain w-full" ref={scrollAreaRef}>
          <div
            ref={containerRef} 
            className="relative bg-muted/20 flex justify-center items-center p-2 sm:p-4 min-h-[600px] w-full"
            style={{ overflow: zoom > 1 ? 'auto' : 'hidden' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Floating Navigation Arrows - Only show for react-pdf, not native iOS viewer */}
            {isPdf && numPages > 1 && !isIOS && !useNativePdfViewer && (
              <>
                {/* Left Arrow */}
                <Button
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  variant="secondary"
                  size="icon"
                  className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-30 touch-manipulation"
                  title="Previous Page (Left Arrow)"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </Button>

                {/* Right Arrow */}
                <Button
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= numPages}
                  variant="secondary"
                  size="icon"
                  className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-30 touch-manipulation"
                  title="Next Page (Right Arrow)"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </Button>
              </>
            )}

            {isPdf ? (
              useNativePdfViewer ? (
                // iOS Native PDF viewer with navigation info
                <div 
                  className="w-full h-full flex items-center justify-center max-w-full overflow-auto relative"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
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
                    src={`${documentUrl}#toolbar=0`}
                    className={cn(
                      "w-full max-w-full border-0",
                      isMobile ? "h-[calc(100vh-180px)]" : "h-[calc(100vh-120px)] min-h-[600px]"
                    )}
                    title="PDF Document"
                  />
                  {canDownload && (
                    <div className="absolute bottom-4 right-4 z-10">
                      <Button onClick={handleDownload} size="sm" variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div 
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
                  console.error('PDF load error:', error);
                  // Fallback to native/browser PDF viewer on any error
                  setUseNativePdfViewer(true);
                  toast({
                    title: 'PDF Loading Issue',
                    description: 'We had trouble loading the PDF viewer, opening with your browser instead.',
                  });
                }}
                error={
                  <div className="flex items-center justify-center p-8 bg-card min-h-[400px]">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading document...</p>
                    </div>
                  </div>
                }
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
                <div 
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isUserZooming ? 'transform 0.2s ease-out' : 'none'
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={1.0}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                    error={
                      <div className="flex items-center justify-center p-8 bg-card min-h-[200px]">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading page...</p>
                        </div>
                      </div>
                    }
                    onLoadSuccess={(page) => {
                      handlePageLoadSuccess(page);
                      initialLoadRef.current = false;
                    }}
                    onRenderAnnotationLayerError={(error) => {
                      console.warn('[DocumentViewer] Annotation layer render error:', error);
                    }}
                    onGetAnnotationsError={(error) => {
                      console.warn('[DocumentViewer] Error getting annotations:', error);
                    }}
                    loading={
                      <div className="flex items-center justify-center p-8 bg-card">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    }
                  />
                </div>
              </Document>
                </div>
              )
            ) : isImage ? (
              <div className="flex items-center justify-center w-full max-w-full overflow-hidden">
                <img
                  src={documentUrl}
                  alt="Document preview"
                  className="max-w-full max-h-full object-contain w-auto h-auto"
                  style={{ 
                    maxWidth: `min(100%, ${Math.min(window.innerWidth - 40, 1400)}px)`,
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                  onContextMenu={!canDownload ? (e) => e.preventDefault() : undefined}
                />
              </div>
            ) : isVideo ? (
              <div className="flex items-center justify-center w-full max-w-full">
                <VideoPlayer
                  src={documentUrl}
                  canDownload={canDownload}
                  className="max-w-full max-h-[80vh] shadow-lg"
                  fileSize={fileSize}
                  fileName={documentUrl.split('/').pop()?.split('?')[0] || 'video'}
                  onError={(error) => {
                    console.error('[DocumentViewer] Video error:', error);
                    toast({
                      title: 'Video Error',
                      description: 'Failed to load video. Please try again or download the file.',
                      variant: 'destructive'
                    });
                  }}
                />
              </div>
            ) : isAudio ? (
              <div className="flex items-center justify-center w-full p-8">
                <div className="w-full max-w-2xl">
                  <audio
                    src={documentUrl}
                    controls
                    controlsList={!canDownload ? 'nodownload' : undefined}
                    onContextMenu={!canDownload ? (e) => e.preventDefault() : undefined}
                    className="w-full"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </div>
            ) : isText ? (
              <div className="w-full max-w-4xl mx-auto p-4">
                <iframe
                  src={documentUrl}
                  className="w-full h-[70vh] bg-card rounded-lg border border-border"
                  sandbox="allow-same-origin"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                  title="Text document preview"
                />
              </div>
            ) : isOffice ? (
              <div className="w-full h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] min-h-[600px]">
                <OfficeDocumentViewer
                  documentUrl={documentUrl}
                  documentType={documentType}
                  onDownload={canDownload ? handleDownload : undefined}
                  canDownload={canDownload}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-6 md:p-12">
                <div className="text-center">
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  {canDownload && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download to View
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Translation Panel */}
      <TranslationPanel
        isOpen={translationOpen}
        onClose={() => setTranslationOpen(false)}
        documentId={documentId}
        currentPage={pageNumber}
        totalPages={numPages || 1}
        extractedText={extractedText}
        isExtracting={isExtracting}
        onPageChange={(page) => setPageNumber(page)}
        pdfDocument={pdfDocumentProxy}
        documentUrl={documentUrl}
        documentType={documentType}
      />
    </div>
  );
}
