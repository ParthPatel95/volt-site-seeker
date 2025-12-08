import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, Languages, FileText, RefreshCw } from 'lucide-react';
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

/**
 * MobileDocumentViewer - Optimized for mobile devices
 * 
 * Key differences from desktop DocumentViewer:
 * 1. Uses native PDF iframe as PRIMARY viewer (not react-pdf)
 * 2. No canvas memory issues (iOS Safari 384MB limit)
 * 3. No race conditions from complex state management
 * 4. Translation uses server-side text extraction (not client-side react-pdf)
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [internalRetryCount, setInternalRetryCount] = useState(0);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountTimeRef = useRef(Date.now());
  const isMountedRef = useRef(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect iOS for Google Docs fallback
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  console.log('[MobileDocumentViewer] MOUNT', {
    documentUrl: documentUrl?.substring(0, 80),
    documentType,
    accessLevel,
    documentId,
    documentName,
    fileSizeBytes,
    isIOS,
    timestamp: new Date().toISOString()
  });

  // File type detection - MUST be before useEffects that depend on isPdf
  const isPdf = documentType === 'application/pdf' || documentUrl?.endsWith('.pdf');
  const isImage = documentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(documentUrl || '');
  const isVideo = documentType?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(documentUrl || '');
  const isAudio = documentType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(documentUrl || '');
  const isText = documentType?.startsWith('text/') || /\.(txt|md|csv|log)$/i.test(documentUrl || '');
  const isOfficeDoc = documentType?.includes('word') || documentType?.includes('document') || /\.docx?$/i.test(documentUrl || '');
  const isOfficeSheet = documentType?.includes('sheet') || /\.xlsx?$/i.test(documentUrl || '');
  const isOfficePresentation = documentType?.includes('presentation') || /\.pptx?$/i.test(documentUrl || '');
  const isOffice = isOfficeDoc || isOfficeSheet || isOfficePresentation;

  console.log('[MobileDocumentViewer] File type detection:', {
    isPdf, isImage, isVideo, isAudio, isText, isOffice
  });

  // Track mount state and cleanup timeouts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      console.log('[MobileDocumentViewer] UNMOUNT');
    };
  }, []);

  // PDF load timeout - 15 seconds then offer fallback options
  useEffect(() => {
    if (!isPdf || !isLoading || loadTimedOut) return;
    
    loadTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        console.warn('[MobileDocumentViewer] PDF load TIMEOUT after 15s');
        setLoadTimedOut(true);
        setIsLoading(false);
      }
    }, 15000);
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [isPdf, isLoading, loadTimedOut, documentUrl]);

  // Translation support (PDFs, images, Office docs, text files)
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

  // Pre-fetch PDF page count for display (lightweight metadata only)
  useEffect(() => {
    if (!isPdf || !documentUrl) return;
    
    let isCancelled = false;
    
    const loadPdfMetadata = async () => {
      console.log('[MobileDocumentViewer] Loading PDF metadata...');
      try {
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configure worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
        }
        
        const loadingTask = pdfjsLib.getDocument({
          url: documentUrl,
          withCredentials: false,
          isEvalSupported: false,
        });
        
        const proxy = await loadingTask.promise;
        
        if (isCancelled) {
          console.log('[MobileDocumentViewer] Metadata load cancelled, destroying proxy');
          proxy.destroy();
          return;
        }
        
        if (isMountedRef.current) {
          setNumPages(proxy.numPages);
        }
        proxy.destroy(); // Clean up immediately - we only needed the page count
        console.log('[MobileDocumentViewer] PDF metadata loaded:', { numPages: proxy.numPages, elapsed: Date.now() - mountTimeRef.current + 'ms' });
      } catch (error) {
        if (isCancelled) return;
        console.error('[MobileDocumentViewer] Failed to load PDF metadata:', error);
        // Don't fail - we can still display the PDF, just without page count
      }
    };
    
    loadPdfMetadata();
    
    return () => {
      isCancelled = true;
    };
  }, [isPdf, documentUrl]);

  // Auto-complete loading for non-iframe content
  useEffect(() => {
    if (!isPdf && !isImage) {
      // For video, audio, text, office - mark as loaded after mount
      const timer = setTimeout(() => {
        console.log('[MobileDocumentViewer] Non-iframe content, auto-completing load');
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPdf, isImage]);

  const handleIframeLoad = useCallback(() => {
    const elapsed = Date.now() - mountTimeRef.current;
    console.log('[MobileDocumentViewer] Iframe LOADED successfully', { elapsed: elapsed + 'ms' });
    if (isMountedRef.current) {
      setIsLoading(false);
      setLoadError(null);
      setInternalRetryCount(0);
    }
  }, []);

  const handleIframeError = useCallback(() => {
    const elapsed = Date.now() - mountTimeRef.current;
    console.error('[MobileDocumentViewer] Iframe FAILED to load', { elapsed: elapsed + 'ms', internalRetryCount });
    if (isMountedRef.current) {
      setIsLoading(false);
      setLoadError('Failed to load document. Please try downloading instead.');
    }
  }, [internalRetryCount]);

  const handleRetry = useCallback(() => {
    console.log('[MobileDocumentViewer] Retrying document load', { retryCount: internalRetryCount + 1 });
    setIsLoading(true);
    setLoadError(null);
    setLoadTimedOut(false);
    setUseGoogleViewer(false);
    setInternalRetryCount(prev => prev + 1);
    mountTimeRef.current = Date.now();
  }, [internalRetryCount]);

  const handleTryGoogleViewer = useCallback(() => {
    console.log('[MobileDocumentViewer] Switching to Google Docs Viewer');
    setUseGoogleViewer(true);
    setLoadTimedOut(false);
    setIsLoading(true);
    mountTimeRef.current = Date.now();
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    console.log('[MobileDocumentViewer] Opening document in new tab');
    window.open(documentUrl, '_blank');
  }, [documentUrl]);

  const handleDownload = async () => {
    console.log('[MobileDocumentViewer] Download requested', { canDownload });
    
    if (!canDownload) {
      toast({
        title: 'Download Restricted',
        description: 'This document is view-only and cannot be downloaded',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Mobile-friendly download using direct link
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentUrl.split('/').pop()?.split('?')[0] || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('[MobileDocumentViewer] Download initiated');
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

  const handleOpenTranslation = useCallback(() => {
    console.log('[MobileDocumentViewer] Opening translation panel', { documentId, numPages });
    setTranslationOpen(true);
  }, [documentId, numPages]);

  const handleCloseTranslation = useCallback(() => {
    console.log('[MobileDocumentViewer] Closing translation panel');
    setTranslationOpen(false);
  }, []);

  // Render timeout state with fallback options
  if (loadTimedOut && isPdf) {
    console.log('[MobileDocumentViewer] Rendering timeout state');
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Taking Too Long</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The document is taking longer than expected to load. Try one of these options:
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} variant="outline" className="touch-manipulation w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Loading
              </Button>
              {isIOS && (
                <Button onClick={handleTryGoogleViewer} variant="outline" className="touch-manipulation w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Try Google Viewer
                </Button>
              )}
              <Button onClick={handleOpenInNewTab} variant="outline" className="touch-manipulation w-full">
                Open in New Tab
              </Button>
              {canDownload && (
                <Button onClick={handleDownload} className="touch-manipulation w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Instead
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (loadError) {
    console.log('[MobileDocumentViewer] Rendering error state:', loadError);
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Document</h3>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRetry} variant="outline" className="touch-manipulation w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              {isPdf && isIOS && (
                <Button onClick={handleTryGoogleViewer} variant="outline" className="touch-manipulation w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Try Google Viewer
                </Button>
              )}
              {canDownload && (
                <Button onClick={handleDownload} className="touch-manipulation w-full">
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
    <div className="flex flex-col h-full w-full">
      {/* Simplified Mobile Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b gap-2">
        {/* Left: Translation button */}
        {supportsTranslation && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTranslation}
            className="h-10 px-3 touch-manipulation"
            disabled={isLoading}
          >
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </Button>
        )}
        
        {/* Center: Page info for PDFs */}
        {isPdf && numPages > 0 && (
          <div className="flex-1 text-center">
            <span className="text-sm text-muted-foreground">
              {numPages} page{numPages !== 1 ? 's' : ''} • Scroll to navigate
            </span>
          </div>
        )}
        {!isPdf && <div className="flex-1" />}
        
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

      {/* Document Content - Full height for native scrolling */}
      <div className="flex-1 overflow-hidden relative">
      {/* Loading overlay - opaque with smooth fade transition */}
      <div 
        className={`absolute inset-0 flex items-center justify-center bg-background z-20 transition-opacity duration-200 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>

        {/* Watermark overlay */}
        {watermarkEnabled && (
          <div 
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
            style={{
              transform: 'rotate(-35deg)',
            }}
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

        {/* PDF - Native iframe viewer with Google Docs fallback for iOS */}
        {isPdf && !useGoogleViewer && (
              <iframe
                key={`native-${internalRetryCount}-${retryKey}`}
            ref={iframeRef}
            src={documentUrl}
            className="w-full h-full border-0"
            title="PDF Document"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
        
        {/* Google Docs Viewer fallback for iOS */}
        {isPdf && useGoogleViewer && (
          <iframe
            key={`google-${internalRetryCount}-${retryKey}`}
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
            className="w-full h-full border-0"
            title="PDF Document (Google Viewer)"
            onLoad={handleIframeLoad}
            onError={() => {
              console.error('[MobileDocumentViewer] Google Viewer also failed');
              if (isMountedRef.current) {
                setLoadError('Both native and Google viewers failed. Please download the document.');
              }
            }}
          />
        )}

        {/* Images */}
        {isImage && (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
            <img
              src={documentUrl}
              alt="Document"
              className="max-w-full max-h-full object-contain"
              onLoad={() => {
                console.log('[MobileDocumentViewer] Image loaded');
                if (isMountedRef.current) {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                console.error('[MobileDocumentViewer] Image failed to load');
                if (isMountedRef.current) {
                  setLoadError('Failed to load image');
                }
              }}
            />
          </div>
        )}

        {/* Video */}
        {isVideo && (
          <div className="w-full h-full">
            <VideoPlayer
              src={documentUrl}
              canDownload={canDownload}
              onError={() => {
                console.error('[MobileDocumentViewer] Video failed to load');
                if (isMountedRef.current) {
                  setLoadError('Failed to load video');
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
                  console.log('[MobileDocumentViewer] Audio ready to play');
                  if (isMountedRef.current) {
                    setIsLoading(false);
                  }
                }}
                onError={() => {
                  console.error('[MobileDocumentViewer] Audio failed to load');
                  if (isMountedRef.current) {
                    setLoadError('Failed to load audio');
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
                console.log('[MobileDocumentViewer] Text file loaded');
                if (isMountedRef.current) {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                console.error('[MobileDocumentViewer] Text file failed to load');
                if (isMountedRef.current) {
                  setLoadError('Failed to load text file');
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
        onClose={handleCloseTranslation}
        documentUrl={documentUrl}
        documentId={documentId}
        documentType={documentType}
        numPages={numPages}
        fileSizeBytes={fileSizeBytes}
      />
    </div>
  );
}

// Simple text file viewer component with cleanup
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
