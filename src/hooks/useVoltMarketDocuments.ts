import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

interface Document {
  id: string;
  listing_id?: string;
  uploader_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: 'financial' | 'legal' | 'technical' | 'marketing' | 'due_diligence' | 'other';
  is_confidential: boolean;
  access_level: 'public' | 'registered' | 'verified' | 'private';
  created_at: string;
  updated_at: string;
}

export const useVoltMarketDocuments = () => {
  const { profile } = useVoltMarketAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async (listingId?: string, documentType?: string) => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-document-management', {
        body: { listingId, documentType },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    documentType: string,
    accessLevel: string = 'private',
    listingId?: string,
    isConfidential: boolean = false
  ) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      // Get upload URL
      const { data, error } = await supabase.functions.invoke('voltmarket-document-management', {
        body: {
          filename: file.name,
          contentType: file.type,
          listingId,
          documentType,
          accessLevel,
          isConfidential
        },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;

      // Upload file to signed URL
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return data.document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const downloadDocument = async (documentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('voltmarket-document-management', {
        body: { path: documentId },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;

      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      return data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('voltmarket-document-management', {
        body: { path: documentId },
        headers: { 'Content-Type': 'application/json' }
      });

      if (error) throw error;
      
      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchDocuments();
    }
  }, [profile]);

  return {
    documents,
    loading,
    fetchDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument
  };
};