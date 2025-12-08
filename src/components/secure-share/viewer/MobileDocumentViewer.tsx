import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Loader2, AlertCircle, Languages, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
  viewerEmail
}: MobileDocumentViewerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Pre-fetch PDF page count for display
  useEffect(() => {
    if (isPdf && documentUrl) {
      const loadPdfMetadata = async () => {
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
          setNumPages(proxy.numPages);
          proxy.destroy(); // Clean up immediately - we only needed the page count
          console.log('[MobileDocumentViewer] PDF metadata loaded', { numPages: proxy.numPages });
        } catch (error) {
          console.error('[MobileDocumentViewer] Failed to load PDF metadata:', error);
          // Don't fail - we can still display the PDF, just without page count
        }
      };
      
      loadPdfMetadata();
    }
  }, [isPdf, documentUrl]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setLoadError(null);
    console.log('[MobileDocumentViewer] Content loaded successfully');
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError('Failed to load document. Please try downloading instead.');
    console.error('[MobileDocumentViewer] Content failed to load');
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
      // Mobile-friendly download using direct link
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

  // Render loading state
  if (isLoading && !loadError) {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Simple toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b gap-2">
          {supportsTranslation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTranslationOpen(true)}
              className="h-10 px-3 touch-manipulation"
              disabled
            >
              <Languages className="w-4 h-4 mr-2" />
              Translate
            </Button>
          )}
          <div className="flex-1" />
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
        
        {/* Loading spinner */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
        
        {/* Hidden iframe to trigger load */}
        {isPdf && (
          <iframe
            ref={iframeRef}
            src={documentUrl}
            className="hidden"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    );
  }

  // Render error state
  if (loadError) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Document</h3>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            {canDownload && (
              <Button onClick={handleDownload} className="touch-manipulation">
                <Download className="w-4 h-4 mr-2" />
                Download Instead
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Simplified Mobile Toolbar - Bottom positioned for easy thumb access */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b gap-2">
        {/* Left: Translation button */}
        {supportsTranslation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTranslationOpen(true)}
            className="h-10 px-3 touch-manipulation"
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

        {/* PDF - Native iframe viewer */}
        {isPdf && (
          <iframe
            ref={iframeRef}
            src={documentUrl}
            className="w-full h-full border-0"
            title="PDF Document"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}

        {/* Images */}
        {isImage && (
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
            <img
              src={documentUrl}
              alt="Document"
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => setLoadError('Failed to load image')}
            />
          </div>
        )}

        {/* Video */}
        {isVideo && (
          <div className="w-full h-full">
            <VideoPlayer
              src={documentUrl}
              canDownload={canDownload}
              onError={() => setLoadError('Failed to load video')}
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
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => setLoadError('Failed to load audio')}
              />
            </div>
          </div>
        )}

        {/* Text files */}
        {isText && (
          <div className="w-full h-full overflow-auto p-4">
            <TextFileViewer 
              url={documentUrl} 
              onLoad={() => setIsLoading(false)}
              onError={() => setLoadError('Failed to load text file')}
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

  useEffect(() => {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load');
        return response.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
        onLoad();
      })
      .catch(() => {
        setLoading(false);
        onError();
      });
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
