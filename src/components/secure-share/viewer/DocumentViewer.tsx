import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  documentUrl: string;
  documentType: string;
  accessLevel: string;
  watermarkEnabled: boolean;
  recipientEmail?: string | null;
}

export function DocumentViewer({
  documentUrl,
  documentType,
  accessLevel,
  watermarkEnabled,
  recipientEmail
}: DocumentViewerProps) {
  const { toast } = useToast();
  const [downloadAttempted, setDownloadAttempted] = useState(false);
  const [zoom, setZoom] = useState(100);

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
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentUrl.split('/').pop() || 'document';
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="w-full h-full flex flex-col">
      <div className={`bg-card flex-1 flex flex-col ${watermarkEnabled ? 'watermark-overlay' : ''}`}>
        {/* Controls */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {isPdf && (
              <div className="flex items-center gap-1">
                <Button 
                  onClick={handleZoomOut} 
                  size="sm" 
                  variant="ghost"
                  className="h-7 md:h-8 px-2"
                  disabled={zoom <= 50}
                >
                  <span className="text-lg">−</span>
                </Button>
                <Button 
                  onClick={handleResetZoom} 
                  size="sm" 
                  variant="ghost"
                  className="h-7 md:h-8 px-2 text-xs"
                >
                  {zoom}%
                </Button>
                <Button 
                  onClick={handleZoomIn} 
                  size="sm" 
                  variant="ghost"
                  className="h-7 md:h-8 px-2"
                  disabled={zoom >= 200}
                >
                  <span className="text-lg">+</span>
                </Button>
              </div>
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
        <div className="relative bg-muted/20 flex-1 overflow-hidden">
          {isPdf ? (
            <div className="relative w-full h-full overflow-auto">
              <div 
                className="inline-block min-w-full"
                style={{
                  width: `${zoom}%`,
                  height: `${zoom}%`,
                  minHeight: '100%'
                }}
              >
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  style={{ 
                    border: 'none',
                    minHeight: '100vh',
                    display: 'block'
                  }}
                  title="Document Viewer"
                />
              </div>
              {/* Invisible overlay to catch right-clicks but allow scrolling */}
              {!canDownload && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    userSelect: 'none'
                  }}
                  onContextMenuCapture={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast({
                      title: 'Action Restricted',
                      description: 'Right-click is disabled for view-only documents',
                      variant: 'destructive'
                    });
                  }}
                />
              )}
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
      </div>
    </div>
  );
}
