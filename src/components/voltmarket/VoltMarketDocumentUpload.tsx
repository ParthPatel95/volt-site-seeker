
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, X } from 'lucide-react';

interface Document {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface VoltMarketDocumentUploadProps {
  listingId?: string;
  existingDocuments?: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  maxDocuments?: number;
  allowedTypes?: string[];
}

export const VoltMarketDocumentUpload: React.FC<VoltMarketDocumentUploadProps> = ({
  listingId,
  existingDocuments = [],
  onDocumentsChange,
  maxDocuments = 20,
  allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png']
}) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(existingDocuments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadDocument = async (file: File): Promise<Document | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      // Use temp folder for new listings without ID yet
      const filePath = listingId ? `${listingId}/${fileName}` : `temp/${fileName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return {
        name: file.name,
        url: data.publicUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + documents.length > maxDocuments) {
      toast({
        title: "Too many documents",
        description: `Maximum ${maxDocuments} documents allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(uploadDocument);
      const uploadedDocs = await Promise.all(uploadPromises);
      const validDocs = uploadedDocs.filter(doc => doc !== null) as Document[];
      
      const newDocuments = [...documents, ...validDocs];
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);

      toast({
        title: "Documents uploaded",
        description: `${validDocs.length} document(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = async (document: Document, index: number) => {
    try {
      const urlParts = document.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = listingId ? `${listingId}/${fileName}` : fileName;

      await supabase.storage
        .from('documents')
        .remove([filePath]);

      const newDocuments = documents.filter((_, i) => i !== index);
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);

      toast({
        title: "Document removed",
        description: "Document deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documents ({documents.length}/{maxDocuments})</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || documents.length >= maxDocuments}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Documents'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {documents.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Supported formats: {allowedTypes.join(', ')}
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Click to upload documents
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((document, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        <Badge variant="outline">{document.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDocument(document, index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
