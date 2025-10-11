import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentActivityTracking } from '@/hooks/useDocumentActivityTracking';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  documentUrl: string;
  documentType: string;
  accessLevel: string;
  watermarkEnabled: boolean;
  recipientEmail?: string | null;
  linkId?: string;
  documentId?: string;
  enableTracking?: boolean;
}

export function DocumentViewer({
  documentUrl,
  documentType,
  accessLevel,
  watermarkEnabled,
  recipientEmail,
  linkId,
  documentId,
  enableTracking = false
}: DocumentViewerProps) {
  const { toast } = useToast();
  const [downloadAttempted, setDownloadAttempted] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [rotation, setRotation] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Activity tracking
  const { trackPageChange, trackScrollDepth } = useDocumentActivityTracking({
    linkId: linkId || '',
    documentId: documentId || '',
    enabled: enableTracking && !!linkId && !!documentId
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
      const response = await fetch(documentUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Create blob with correct MIME type
      const blob = new Blob([arrayBuffer], { type: documentType });
      const url = window.URL.createObjectURL(blob);
      
      // Extract filename from URL, preserving the full name with extension
      let filename = documentUrl.split('/').pop()?.split('?')[0] || 'document';
      
      // Decode URL-encoded filename
      filename = decodeURIComponent(filename);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download Started',
        description: 'Your document is being downloaded'
      });
    } catch (error) {
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

  // Watermark overlay
  useEffect(() => {
    if (!watermarkEnabled) return;

    const watermarkText = recipientEmail 
      ? `Wattbyte Inc. - ${recipientEmail}` 
      : 'Wattbyte Inc. - CONFIDENTIAL';
    const style = document.createElement('style');
    style.innerHTML = `
      .watermark-overlay::before {
        content: "${watermarkText}";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 4rem;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.05);
        pointer-events: none;
        z-index: 9999;
        white-space: nowrap;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [watermarkEnabled, recipientEmail]);

  const isPdf = documentType === 'application/pdf' || documentUrl.endsWith('.pdf');
  
  // Build PDF URL - hide toolbar for view-only
  const pdfUrl = isPdf && !canDownload
    ? `${documentUrl}#toolbar=0`
    : documentUrl;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

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
    <div className="w-full h-full flex flex-col">
      <div className={`bg-card flex-1 flex flex-col ${watermarkEnabled ? 'watermark-overlay' : ''}`}>
        {/* Controls */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {isPdf && numPages > 0 && (
              <>
                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={pageNumber <= 1}
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground min-w-[80px] text-center">
                    {pageNumber} / {numPages}
                  </span>
                  <Button 
                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))} 
                    size="sm" 
                    variant="ghost"
                    className="h-7 md:h-8 px-2"
                    disabled={pageNumber >= numPages}
                    title="Next Page"
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
          
          {canDownload && (
            <Button onClick={handleDownload} size="sm" className="text-xs md:text-sm">
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
        </div>

        {/* Document Display */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="relative bg-muted/20 min-h-full flex items-center justify-center p-4">
            {isPdf ? (
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <p className="text-sm text-destructive mb-4">
                      Failed to load PDF document
                    </p>
                    {canDownload && (
                      <Button onClick={handleDownload} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Instead
                      </Button>
                    )}
                  </div>
                }
              >
              <Page
                pageNumber={pageNumber}
                scale={zoom}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                  loading={
                    <div className="flex items-center justify-center p-8 bg-card">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  }
                />
              </Document>
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
    </div>
  );
}
