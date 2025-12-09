import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedAESOReport {
  id: string;
  share_token: string;
  title: string;
  report_type: string;
  password_hash: string | null;
  expires_at: string | null;
  max_views: number | null;
  current_views: number;
  status: string;
  created_at: string;
  created_by: string | null;
}

export interface ReportView {
  id: string;
  viewer_name: string | null;
  viewer_email: string | null;
  viewed_at: string;
  viewer_user_agent: string | null;
}

export function useSharedAESOReports() {
  const [reports, setReports] = useState<SharedAESOReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewsLoading, setViewsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSharedReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from('shared_aeso_reports')
        .select('id, share_token, title, report_type, password_hash, expires_at, max_views, current_views, status, created_at, created_by')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching shared reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shared reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getReportViews = useCallback(async (reportId: string): Promise<ReportView[]> => {
    setViewsLoading(reportId);
    try {
      const { data, error } = await supabase
        .from('shared_aeso_report_views')
        .select('id, viewer_name, viewer_email, viewed_at, viewer_user_agent')
        .eq('report_id', reportId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching report views:', error);
      return [];
    } finally {
      setViewsLoading(null);
    }
  }, []);

  const revokeReport = useCallback(async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('shared_aeso_reports')
        .update({ status: 'revoked' })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: 'revoked' } : r
      ));

      toast({
        title: 'Report Revoked',
        description: 'The share link has been disabled'
      });
    } catch (error) {
      console.error('Error revoking report:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke report',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('shared_aeso_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== reportId));

      toast({
        title: 'Report Deleted',
        description: 'The shared report has been removed'
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const getShareUrl = (shareToken: string) => {
    return `https://wattbyte.com/shared/aeso-report/${shareToken}`;
  };

  return {
    reports,
    loading,
    viewsLoading,
    fetchSharedReports,
    getReportViews,
    revokeReport,
    deleteReport,
    getShareUrl
  };
}
