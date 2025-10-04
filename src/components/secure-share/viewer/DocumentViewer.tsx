import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Watermark overlay
  useEffect(() => {
    if (!watermarkEnabled) return;

    const watermarkText = recipientEmail || 'CONFIDENTIAL';
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className={`bg-card rounded-lg shadow-lg overflow-hidden ${watermarkEnabled ? 'watermark-overlay' : ''}`}>
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>
              {accessLevel === 'view_only' && 'View Only'}
              {accessLevel === 'download' && 'View & Download'}
              {accessLevel === 'no_download' && 'View Only (No Download)'}
            </span>
          </div>
          
          {canDownload && (
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Document Display */}
        <div className="relative bg-muted/20" style={{ minHeight: '80vh' }}>
          {isPdf ? (
            <iframe
              src={documentUrl}
              className="w-full h-full"
              style={{ minHeight: '80vh', border: 'none' }}
              title="Document Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
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
