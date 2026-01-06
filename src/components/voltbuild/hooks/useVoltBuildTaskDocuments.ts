import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildDocument } from '../types/voltbuild.types';
import { toast } from 'sonner';

export interface TaskDocumentWithSecure extends VoltBuildDocument {
  secure_document?: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string | null;
    file_size: number | null;
  } | null;
}

export function useVoltBuildTaskDocuments(taskId: string | null) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['voltbuild-task-documents', taskId],
    queryFn: async (): Promise<TaskDocumentWithSecure[]> => {
      if (!taskId) return [];

      // Fetch voltbuild documents
      const { data: docs, error } = await supabase
        .from('voltbuild_documents')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!docs || docs.length === 0) return [];

      // Get secure document IDs
      const secureDocIds = docs.filter(d => d.secure_document_id).map(d => d.secure_document_id);
      
      let secureDocMap: Record<string, { id: string; file_name: string; file_url: string; file_type: string | null; file_size: number | null }> = {};
      if (secureDocIds.length > 0) {
        const { data: secureDocs } = await supabase
          .from('secure_documents')
          .select('id, file_name, file_url, file_type, file_size')
          .in('id', secureDocIds);
        
        if (secureDocs) {
          secureDocMap = secureDocs.reduce((acc, sd) => {
            acc[sd.id] = sd;
            return acc;
          }, {} as typeof secureDocMap);
        }
      }

      return docs.map(doc => ({
        ...doc,
        secure_document: doc.secure_document_id ? secureDocMap[doc.secure_document_id] || null : null
      }));
    },
    enabled: !!taskId,
  });

  const attachDocumentMutation = useMutation({
    mutationFn: async ({ 
      task_id, 
      project_id,
      secure_document_id, 
      file_name 
    }: { 
      task_id: string; 
      project_id: string;
      secure_document_id: string;
      file_name: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('voltbuild_documents')
        .insert({
          task_id,
          project_id,
          secure_document_id,
          file_name,
          file_url: '', // We'll use secure_document reference
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-task-documents', taskId] });
      toast.success('Document attached');
    },
    onError: (error: Error) => {
      toast.error(`Failed to attach document: ${error.message}`);
    },
  });

  const detachDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('voltbuild_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-task-documents', taskId] });
      toast.success('Document removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove document: ${error.message}`);
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    attachDocument: attachDocumentMutation.mutate,
    detachDocument: detachDocumentMutation.mutate,
    isAttaching: attachDocumentMutation.isPending,
    isDetaching: detachDocumentMutation.isPending,
  };
}

// Hook to fetch available SecureShare documents
export function useSecureDocuments() {
  return useQuery({
    queryKey: ['secure-documents-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_documents')
        .select('id, file_name, file_url, file_type, file_size, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
    },
  });
}
