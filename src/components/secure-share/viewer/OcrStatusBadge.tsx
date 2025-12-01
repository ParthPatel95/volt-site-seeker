import { FileText, Scan, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OcrStatusBadgeProps {
  status: 'text-layer' | 'ai-ocr' | 'browser-ocr' | 'scanned-warning';
  confidence?: number;
  className?: string;
}

export function OcrStatusBadge({ status, confidence, className }: OcrStatusBadgeProps) {
  const config = {
    'text-layer': {
      icon: FileText,
      label: 'Text Layer',
      variant: 'secondary' as const,
      color: 'text-muted-foreground'
    },
    'ai-ocr': {
      icon: Scan,
      label: 'AI OCR',
      variant: 'default' as const,
      color: 'text-primary'
    },
    'browser-ocr': {
      icon: Scan,
      label: 'Browser OCR',
      variant: 'outline' as const,
      color: 'text-muted-foreground'
    },
    'scanned-warning': {
      icon: AlertTriangle,
      label: 'Scanned PDF',
      variant: 'destructive' as const,
      color: 'text-destructive'
    }
  };
  
  const { icon: Icon, label, variant, color } = config[status];
  
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      <Icon className={cn("w-3 h-3", color)} />
      <span>{label}</span>
      {confidence !== undefined && (
        <span className="ml-1 text-[10px] opacity-70">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </Badge>
  );
}
