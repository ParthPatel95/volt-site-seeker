import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, X, FileText } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullScreenDocumentViewerProps {
  document: any;
  allDocuments: any[];
  linkData: any;
  viewerData: { name: string; email: string } | null;
  onBack: () => void;
  onDocumentChange: (document: any) => void;
}

export function FullScreenDocumentViewer({
  document,
  allDocuments,
  linkData,
  viewerData,
  onBack,
  onDocumentChange
}: FullScreenDocumentViewerProps) {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const currentIndex = allDocuments.findIndex(doc => doc.id === document.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allDocuments.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onDocumentChange(allDocuments[currentIndex - 1]);
    }
  }, [hasPrevious, allDocuments, currentIndex, onDocumentChange]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onDocumentChange(allDocuments[currentIndex + 1]);
    }
  }, [hasNext, allDocuments, currentIndex, onDocumentChange]);

  // Minimum swipe distance (in px) - increased to reduce accidental triggers
  const minSwipeDistance = 100;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Only trigger swipe if it's primarily horizontal (not vertical scrolling)
    const isHorizontalSwipe = Math.abs(distance) > minSwipeDistance;

    if (isLeftSwipe && hasNext && isHorizontalSwipe) {
      handleNext();
    }
    if (isRightSwipe && hasPrevious && isHorizontalSwipe) {
      handlePrevious();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, hasPrevious, hasNext, handlePrevious, handleNext]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Header Bar - Fixed 64px height */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 border-b bg-card/95 backdrop-blur-xl shadow-sm h-16"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-2">
          {/* Left: Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0 touch-manipulation min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Back</span>}
          </Button>

          {/* Center: Document Name & Position */}
          <div className="flex-1 min-w-0 text-center">
            <h2 className={cn(
              "font-semibold truncate",
              isMobile ? "text-xs" : "text-sm"
            )} title={document.file_name}>
              {document.file_name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} of {allDocuments.length}
            </p>
          </div>

          {/* Right: Navigation & Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              title="Previous document (←)"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!hasNext}
              title="Next document (→)"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {linkData.access_level === 'download' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const link = window.document.createElement('a');
                  link.href = document.file_url;
                  link.download = document.file_name;
                  link.click();
                }}
                title="Download document"
                className="touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {allDocuments.length > 1 && (
              <Button
                variant="outline"
                size={isMobile ? "icon" : "sm"}
                onClick={() => setShowSidebar(true)}
                title="All documents"
                className="touch-manipulation min-h-[44px]"
              >
                <FileText className="w-4 h-4" />
                {!isMobile && <span className="ml-2">All ({allDocuments.length})</span>}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="absolute inset-0 pt-16">
        <DocumentViewer
          documentUrl={document.file_url}
          documentType={document.file_type}
          accessLevel={linkData.access_level}
          watermarkEnabled={linkData.watermark_enabled}
          recipientEmail={linkData.recipient_email}
          linkId={linkData.id}
          documentId={document.id}
          enableTracking={true}
          viewerName={viewerData?.name}
          viewerEmail={viewerData?.email}
        />
      </div>

      {/* Optional Sidebar for Quick Document Switching */}
      {showSidebar && (
        <div className="absolute right-0 top-16 bottom-0 w-80 bg-card border-l shadow-xl animate-in slide-in-from-right duration-300 z-30">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">Documents</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {allDocuments.map((doc, index) => {
              const isActive = doc.id === document.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    onDocumentChange(doc);
                    setShowSidebar(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 border-b transition-colors",
                    isActive 
                      ? "bg-primary/10 border-l-4 border-l-primary" 
                      : "hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium truncate mb-1">
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Document {index + 1}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
