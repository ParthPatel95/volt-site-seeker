import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, File, Image, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useSecureDocuments } from './hooks/useVoltBuildTaskDocuments';
import { formatDistanceToNow } from 'date-fns';

interface VoltBuildDocumentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (documents: Array<{ id: string; file_name: string }>) => void;
  excludeIds?: string[];
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return <File className="w-4 h-4" />;
  if (fileType.includes('image')) return <Image className="w-4 h-4" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />;
  if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4" />;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function VoltBuildDocumentPicker({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
}: VoltBuildDocumentPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Array<{ id: string; file_name: string }>>([]);
  const { data: documents, isLoading } = useSecureDocuments();

  const filteredDocuments = (documents || [])
    .filter(doc => !excludeIds.includes(doc.id))
    .filter(doc => 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleDocument = (doc: { id: string; file_name: string }) => {
    setSelectedDocs(prev => {
      const exists = prev.some(d => d.id === doc.id);
      if (exists) {
        return prev.filter(d => d.id !== doc.id);
      }
      return [...prev, doc];
    });
  };

  const handleConfirm = () => {
    onSelect(selectedDocs);
    setSelectedDocs([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedDocs([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Attach Documents from SecureShare</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="w-12 h-12 mb-2 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocs.some(d => d.id === doc.id);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleDocument({ id: doc.id, file_name: doc.file_name })}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(doc.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    {doc.file_type && (
                      <Badge variant="outline" className="text-xs">
                        {doc.file_type.split('/').pop()?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedDocs.length === 0}>
              Attach Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
