import { FileText } from 'lucide-react';
import { usePdfThumbnail } from '@/hooks/usePdfThumbnail';

interface DocumentThumbnailProps {
  fileUrl: string;
  fileType: string;
  storagePath: string;
}

export function DocumentThumbnail({ fileUrl, fileType, storagePath }: DocumentThumbnailProps) {
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');
  
  const { thumbnailUrl, loading } = usePdfThumbnail(isPdf ? fileUrl : null);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/95 to-muted/95">
        <div className="animate-pulse">
          <FileText className="w-20 h-20 text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  if (isPdf && thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt="Document preview"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (isImage) {
    return (
      <img
        src={fileUrl}
        alt="Document preview"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/95 to-muted/95">
      <FileText className="w-20 h-20 text-muted-foreground/30" />
    </div>
  );
}
