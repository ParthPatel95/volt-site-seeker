import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildTaskComment } from '../types/voltbuild.types';
import { toast } from 'sonner';

export interface CommentWithUser extends VoltBuildTaskComment {
  user?: {
    id: string;
    full_name: string | null;
    email?: string;
  } | null;
}

export function useVoltBuildTaskComments(taskId: string | null) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['voltbuild-task-comments', taskId],
    queryFn: async (): Promise<CommentWithUser[]> => {
      if (!taskId) return [];

      // First get comments
      const { data: comments, error } = await supabase
        .from('voltbuild_task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments || comments.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(comments.filter(c => c.user_id).map(c => c.user_id))];
      
      // Fetch user profiles
      let userMap: Record<string, { id: string; full_name: string | null; email: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, { id: string; full_name: string | null; email: string | null }>);
        }
      }

      return comments.map(comment => ({
        ...comment,
        user: comment.user_id ? userMap[comment.user_id] || null : null
      }));
    },
    enabled: !!taskId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ task_id, content }: { task_id: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('voltbuild_task_comments')
        .insert({
          task_id,
          content,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-task-comments', taskId] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('voltbuild_task_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-task-comments', taskId] });
      toast.success('Comment deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    error: commentsQuery.error,
    createComment: createCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}
