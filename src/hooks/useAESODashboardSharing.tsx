import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShareLink {
  id: string;
  dashboard_id: string;
  created_by: string;
  share_token: string;
  password_hash: string | null;
  require_otp: boolean;
  recipient_email: string | null;
  recipient_name: string | null;
  access_level: 'view_only' | 'view_and_export';
  status: 'active' | 'revoked' | 'expired';
  max_views: number | null;
  current_views: number;
  expires_at: string | null;
  allowed_domains: string[] | null;
  allowed_ips: string[] | null;
  custom_branding: any;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShareOptions {
  password?: string;
  requireOtp?: boolean;
  recipientEmail?: string;
  recipientName?: string;
  accessLevel?: 'view_only' | 'view_and_export';
  maxViews?: number;
  expiresAt?: string;
  allowedDomains?: string[];
  allowedIps?: string[];
  customBranding?: any;
}

export const useAESODashboardSharing = () => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateShareToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createShareLink = async (dashboardId: string, options: ShareOptions = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const shareToken = generateShareToken();

      const { data, error } = await supabase
        .from('aeso_shared_dashboards')
        .insert({
          dashboard_id: dashboardId,
          created_by: user.id,
          share_token: shareToken,
          password_hash: options.password || null,
          require_otp: options.requireOtp || false,
          recipient_email: options.recipientEmail || null,
          recipient_name: options.recipientName || null,
          access_level: options.accessLevel || 'view_only',
          max_views: options.maxViews || null,
          expires_at: options.expiresAt || null,
          allowed_domains: options.allowedDomains || null,
          allowed_ips: options.allowedIps || null,
          custom_branding: options.customBranding || {},
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Share link created successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create share link',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateShareLink = async (shareId: string, updates: Partial<ShareLink>) => {
    try {
      const { error } = await supabase
        .from('aeso_shared_dashboards')
        .update(updates)
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Share link updated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to update share link',
        variant: 'destructive',
      });
      return false;
    }
  };

  const revokeShareLink = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('aeso_shared_dashboards')
        .update({ status: 'revoked' })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Share link revoked successfully',
      });

      return true;
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke share link',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteShareLink = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('aeso_shared_dashboards')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Share link deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete share link',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getShareLinks = async (dashboardId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aeso_shared_dashboards')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks((data || []) as ShareLink[]);
      return data as ShareLink[];
    } catch (error) {
      console.error('Error fetching share links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load share links',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const validateShareToken = async (token: string, password?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-dashboard-share', {
        body: { token, password },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating share token:', error);
      return null;
    }
  };

  return {
    shareLinks,
    loading,
    createShareLink,
    updateShareLink,
    revokeShareLink,
    deleteShareLink,
    getShareLinks,
    validateShareToken,
  };
};
