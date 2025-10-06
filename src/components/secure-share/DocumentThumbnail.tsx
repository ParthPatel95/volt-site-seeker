import { FileText, File, Image as ImageIcon } from 'lucide-react';

interface DocumentThumbnailProps {
  fileUrl: string;
  fileType: string;
  storagePath: string;
}

export function DocumentThumbnail({ fileUrl, fileType, storagePath }: DocumentThumbnailProps) {
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType?.startsWith('image/');
  
  // For images, show the actual image
  if (isImage && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt="Document preview"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // For PDFs and other documents, show an icon
  const Icon = isPdf ? FileText : File;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <Icon className="w-24 h-24 text-primary/40" />
      {isPdf && (
        <span className="text-xs text-muted-foreground mt-2 font-medium">PDF</span>
      )}
    </div>
  );
}
