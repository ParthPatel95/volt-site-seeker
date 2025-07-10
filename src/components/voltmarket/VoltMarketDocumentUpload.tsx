import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useVoltMarketListings } from '@/hooks/useVoltMarketListings';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, X } from 'lucide-react';

interface Document {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  document_type: string;
  uploadedAt: string;
  description?: string;
}

interface VoltMarketDocumentUploadProps {
  listingId?: string;
  existingDocuments?: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  maxDocuments?: number;
  allowedTypes?: string[];
}

const DOCUMENT_TYPES = [
  { value: 'financial', label: 'Financial' },
  { value: 'technical', label: 'Technical' },
  { value: 'legal', label: 'Legal' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'regulatory', label: 'Regulatory' }
];

export const VoltMarketDocumentUpload: React.FC<VoltMarketDocumentUploadProps> = ({
  listingId,
  existingDocuments = [],
  onDocumentsChange,
  maxDocuments = 20,
  allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png']
}) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(existingDocuments);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [selectedListingId, setSelectedListingId] = useState<string>(listingId || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useVoltMarketAuth();
  const { userListings } = useVoltMarketListings();
  const { toast } = useToast();

  const uploadDocument = async (file: File): Promise<Document | null> => {
    if (!selectedDocumentType) {
      toast({
        title: "Document type required",
        description: "Please select a document type before uploading",
        variant: "destructive"
      });
      return null;
    }

    if (!profile?.id) {
      console.error('No profile ID available:', { profile, user: profile?.user_id });
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Starting document upload for:', file.name);
      console.log('Profile:', { id: profile.id, user_id: profile.user_id });
      
      // Simplified file path - just use profile ID for all uploads
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${profile.user_id}/${fileName}`;
      
      console.log('Upload path:', filePath);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      const documentData = {
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        document_type: selectedDocumentType,
        uploadedAt: new Date().toISOString(),
        description: documentDescription || undefined
      };

      // Save to database if listing is selected or this is for a specific listing
      const targetListingId = selectedListingId || listingId;
      if (targetListingId) {
        console.log('Saving to database for listing:', targetListingId);
        const { data: dbData, error: dbError } = await supabase
          .from('voltmarket_documents')
          .insert({
            listing_id: targetListingId,
            uploader_id: profile.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: file.size,
            document_type: selectedDocumentType,
            description: documentDescription || null,
            is_private: true
          })
          .select()
          .maybeSingle();

        if (dbError) {
          console.error('Database save error:', dbError);
          // Clean up uploaded file
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error(`Database save failed: ${dbError.message}`);
        }

        console.log('Database save successful:', dbData);
        return {
          ...documentData,
          id: dbData.id
        };
      }

      return documentData;
    } catch (error) {
      console.error('Error uploading document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Upload failed", 
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    console.log('File selection started:', files.length, 'files selected');
    console.log('Selected document type:', selectedDocumentType);
    console.log('Current profile:', profile);
    
    if (!selectedDocumentType) {
      console.log('No document type selected');
      toast({
        title: "Document type required",
        description: "Please select a document type before uploading",
        variant: "destructive"
      });
      return;
    }
    
    if (files.length + documents.length > maxDocuments) {
      console.log('Too many documents:', files.length + documents.length, 'max:', maxDocuments);
      toast({
        title: "Too many documents",
        description: `Maximum ${maxDocuments} documents allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    console.log('Starting upload process...');

    try {
      const uploadPromises = files.map((file, index) => {
        console.log(`Uploading file ${index + 1}:`, file.name, file.type, file.size);
        return uploadDocument(file);
      });
      
      const uploadedDocs = await Promise.all(uploadPromises);
      console.log('All uploads completed:', uploadedDocs);
      
      const validDocs = uploadedDocs.filter(doc => doc !== null) as Document[];
      console.log('Valid documents:', validDocs.length);
      
      const newDocuments = [...documents, ...validDocs];
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);

      // Reset form
      setSelectedDocumentType('');
      setDocumentDescription('');

      if (validDocs.length > 0) {
        toast({
          title: "Documents uploaded",
          description: `${validDocs.length} document(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload process failed:', error);
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
      console.log('Upload process completed');
    }
  };

  const removeDocument = async (document: Document, index: number) => {
    try {
      // Remove from database if it has an ID
      if (document.id) {
        const { error: dbError } = await supabase
          .from('voltmarket_documents')
          .delete()
          .eq('id', document.id);

        if (dbError) throw dbError;
      }

      // Remove from storage
      const urlParts = document.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${profile?.user_id}/${fileName}`;

      console.log('Removing file:', filePath);
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
      console.error('Error removing document:', error);
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
      </div>

      {/* Document Upload Form */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-type">Document Type *</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="document-description">Description (Optional)</Label>
                <Input
                  id="document-description"
                  type="text"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Brief description of the document"
                />
              </div>
            </div>

            {!listingId && userListings.length > 0 && (
              <div className="mt-4">
                <Label htmlFor="listing-select">Associate with Listing (Optional)</Label>
                <Select value={selectedListingId} onValueChange={setSelectedListingId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a listing (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General document (no listing)</SelectItem>
                    {userListings.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id}>
                        {listing.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || documents.length >= maxDocuments || !selectedDocumentType}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
              
              <p className="text-sm text-gray-500">
                Supported formats: {allowedTypes.join(', ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">Select a document type and upload files above</p>
        </div>
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
                        <Badge variant="outline">
                          {DOCUMENT_TYPES.find(t => t.value === document.document_type)?.label || document.document_type}
                        </Badge>
                        {document.description && (
                          <span className="text-xs">• {document.description}</span>
                        )}
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