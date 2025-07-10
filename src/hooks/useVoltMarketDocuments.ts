import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';

interface Document {
  id: string;
  listing_id?: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type?: string;
  document_type: 'financial' | 'legal' | 'technical' | 'marketing' | 'due_diligence' | 'other';
  is_private: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
  original_filename?: string;
  access_level?: string;
  is_confidential?: boolean;
}

export const useVoltMarketDocuments = () => {
  const { profile } = useVoltMarketAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async (listingId?: string, documentType?: string) => {
    if (!profile) return;

    setLoading(true);
    try {
      let query = supabase
        .from('voltmarket_documents')
        .select('*')
        .eq('uploader_id', profile.id);

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      if (documentType && documentType !== 'all') {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match expected interface
      const mappedDocuments = (data || []).map(doc => ({
        ...doc,
        original_filename: doc.file_name,
        access_level: doc.is_private ? 'private' : 'public',
        is_confidential: doc.is_private,
        document_type: (doc.document_type || 'other') as 'financial' | 'legal' | 'technical' | 'marketing' | 'due_diligence' | 'other',
        created_at: doc.created_at || new Date().toISOString(),
        description: doc.description || ''
      }));
      
      setDocuments(mappedDocuments);
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
      // Generate unique file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `documents/${profile.id}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document record
      const { data: documentData, error: dbError } = await supabase
        .from('voltmarket_documents')
        .insert({
          listing_id: listingId || null,
          uploader_id: profile.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          document_type: documentType,
          is_private: accessLevel === 'private' || isConfidential,
          description: `${documentType} document`
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return documentData;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const downloadDocument = async (documentId: string) => {
    try {
      const { data: document, error } = await supabase
        .from('voltmarket_documents')
        .select('file_url, file_name')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      // Create download link
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      return document;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('voltmarket_documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL for storage deletion
      const url = new URL(document.file_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Extract the file path

      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([filePath]);

      // Delete from database
      const { error: deleteError } = await supabase
        .from('voltmarket_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;
      
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