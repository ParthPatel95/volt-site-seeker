import { FileText, File } from 'lucide-react';
import { usePdfThumbnail } from '@/hooks/usePdfThumbnail';

interface DocumentThumbnailProps {
  fileUrl: string;
  fileType: string;
  storagePath: string;
}

export function DocumentThumbnail({ fileUrl, fileType, storagePath }: DocumentThumbnailProps) {
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');
  
  const { thumbnailUrl, loading } = usePdfThumbnail(storagePath, isPdf);

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
      <div className="absolute inset-0 bg-white">
        <iframe
          src={`${thumbnailUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full pointer-events-none"
          title="PDF preview"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
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

  // Default fallback for other file types
  const Icon = isPdf ? FileText : File;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/95 to-muted/95">
      <Icon className="w-20 h-20 text-muted-foreground/30" />
    </div>
  );
}
