import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfficeDocumentViewerProps {
  documentUrl: string;
  documentType: string;
  onDownload?: () => void;
  canDownload?: boolean;
}

type ViewerType = 'microsoft' | 'google' | 'error';

export function OfficeDocumentViewer({
  documentUrl,
  documentType,
  onDownload,
  canDownload = true
}: OfficeDocumentViewerProps) {
  const [viewerType, setViewerType] = useState<ViewerType>('microsoft');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWord = documentType?.includes('word') || documentType?.includes('document') || /\.docx?$/i.test(documentUrl);
  const isExcel = documentType?.includes('sheet') || /\.xlsx?$/i.test(documentUrl);
  const isPowerPoint = documentType?.includes('presentation') || /\.pptx?$/i.test(documentUrl);

  const getDocumentTypeName = () => {
    if (isWord) return 'Word Document';
    if (isExcel) return 'Excel Spreadsheet';
    if (isPowerPoint) return 'PowerPoint Presentation';
    return 'Office Document';
  };

  // Build viewer URLs
  const getMicrosoftViewerUrl = () => {
    const encodedUrl = encodeURIComponent(documentUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  const getGoogleViewerUrl = () => {
    const encodedUrl = encodeURIComponent(documentUrl);
    return `https://docs.google.com/viewer?embedded=true&url=${encodedUrl}`;
  };

  const viewerUrl = viewerType === 'microsoft' 
    ? getMicrosoftViewerUrl() 
    : getGoogleViewerUrl();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [documentUrl, viewerType]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log(`[OfficeViewer] Document loaded via ${viewerType} viewer`);
  };

  const handleIframeError = () => {
    console.error(`[OfficeViewer] Failed to load with ${viewerType} viewer`);
    
    if (viewerType === 'microsoft') {
      console.log('[OfficeViewer] Falling back to Google Docs viewer');
      setViewerType('google');
    } else {
      setIsLoading(false);
      setError('Unable to preview this document. Please download to view.');
      setViewerType('error');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {canDownload && onDownload && (
          <Button onClick={onDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download {getDocumentTypeName()}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading {getDocumentTypeName()}...
            </p>
            <p className="text-xs text-muted-foreground">
              Using {viewerType === 'microsoft' ? 'Microsoft Office' : 'Google Docs'} viewer
            </p>
          </div>
        </div>
      )}
      
      <iframe
        src={viewerUrl}
        className={cn(
          "w-full h-full border-0",
          isLoading && "opacity-0"
        )}
        title={`${getDocumentTypeName()} Preview`}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  );
}
