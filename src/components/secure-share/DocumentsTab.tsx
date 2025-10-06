import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Plus, FileText, Download, Link as LinkIcon, Trash2, ExternalLink, Eye } from 'lucide-react';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { CreateLinkDialog } from './CreateLinkDialog';
import { DocumentViewerDialog } from './DocumentViewerDialog';
import { DocumentThumbnail } from './DocumentThumbnail';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function DocumentsTab() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createLinkDialogOpen, setCreateLinkDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string; storage_path: string; file_type: string } | null>(null);
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['secure-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secure_documents')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Document deleted',
        description: 'The document has been removed successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      investor_deck: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      energy_bill: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      loi: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      ppa: 'bg-green-500/10 text-green-600 border-green-500/20',
      land_title: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      financial: 'bg-red-500/10 text-red-600 border-red-500/20',
      legal: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      technical: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };
    return colors[category] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-muted-foreground">
            Upload and manage secure documents for sharing
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Document Preview */}
              <div className="aspect-[3/4] bg-muted relative overflow-hidden border-b">
                <DocumentThumbnail
                  fileUrl={doc.file_url}
                  fileType={doc.file_type}
                  storagePath={doc.storage_path}
                />
                
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument({ 
                        id: doc.id, 
                        name: doc.file_name,
                        storage_path: doc.storage_path,
                        file_type: doc.file_type
                      });
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument({ 
                        id: doc.id, 
                        name: doc.file_name,
                        storage_path: doc.storage_path,
                        file_type: doc.file_type
                      });
                      setCreateLinkDialogOpen(true);
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border backdrop-blur-sm ${getCategoryBadge(
                      doc.category
                    )}`}
                  >
                    {doc.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Document Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold truncate text-sm">{doc.file_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started with secure sharing
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </Card>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => refetch()}
      />

      {selectedDocument && (
        <>
          <CreateLinkDialog
            open={createLinkDialogOpen}
            onOpenChange={setCreateLinkDialogOpen}
            documentId={selectedDocument.id}
            documentName={selectedDocument.name}
            onSuccess={() => refetch()}
          />

          <DocumentViewerDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            document={selectedDocument}
          />
        </>
      )}
    </div>
  );
}
