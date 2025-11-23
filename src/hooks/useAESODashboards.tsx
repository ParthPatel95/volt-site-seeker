import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Dashboard {
  id: string;
  created_by: string;
  dashboard_name: string;
  description: string | null;
  layout_config: {
    lg: any[];
    md: any[];
    sm: any[];
  };
  created_at: string;
  updated_at: string;
  is_template: boolean;
  thumbnail_url: string | null;
  view_count?: number;
  tags?: string[];
  is_starred?: boolean;
  widget_count?: number;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type: string;
  widget_config: any;
  data_source: string;
  data_filters: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

export const useAESODashboards = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('aeso_custom_dashboards')
        .select(`
          *,
          dashboard_tags(tag),
          dashboard_stars!left(user_id),
          aeso_dashboard_widgets(id)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include computed fields
      const transformedData = (data || []).map((d: any) => ({
        ...d,
        tags: d.dashboard_tags?.map((t: any) => t.tag) || [],
        is_starred: user ? d.dashboard_stars?.some((s: any) => s.user_id === user.id) : false,
        widget_count: d.aeso_dashboard_widgets?.length || 0,
        layout_config: d.layout_config || { lg: [], md: [], sm: [] },
      }));
      
      setDashboards(transformedData as Dashboard[]);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('aeso_custom_dashboards')
        .insert({
          dashboard_name: name,
          description,
          created_by: user.id,
          layout_config: { lg: [], md: [], sm: [] },
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Dashboard created successfully',
      });

      await fetchDashboards();
      return data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dashboard',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateDashboard = async (id: string, updates: Partial<Dashboard>) => {
    try {
      const { error } = await supabase
        .from('aeso_custom_dashboards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Dashboard updated successfully',
      });

      await fetchDashboards();
      return true;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to update dashboard',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteDashboard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('aeso_custom_dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Dashboard deleted successfully',
      });

      await fetchDashboards();
      return true;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dashboard',
        variant: 'destructive',
      });
      return false;
    }
  };

  const duplicateDashboard = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the original dashboard
      const { data: original, error: fetchError } = await supabase
        .from('aeso_custom_dashboards')
        .select('*, aeso_dashboard_widgets(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create new dashboard
      const { data: newDashboard, error: createError } = await supabase
        .from('aeso_custom_dashboards')
        .insert({
          dashboard_name: `${original.dashboard_name} (Copy)`,
          description: original.description,
          created_by: user.id,
          layout_config: original.layout_config,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy widgets if any
      if (original.aeso_dashboard_widgets?.length > 0) {
        const widgets = original.aeso_dashboard_widgets.map((w: any) => ({
          dashboard_id: newDashboard.id,
          widget_type: w.widget_type,
          widget_config: w.widget_config,
          data_source: w.data_source,
          data_filters: w.data_filters,
          position_x: w.position_x,
          position_y: w.position_y,
          width: w.width,
          height: w.height,
        }));

        const { error: widgetsError } = await supabase
          .from('aeso_dashboard_widgets')
          .insert(widgets);

        if (widgetsError) throw widgetsError;
      }

      toast({
        title: 'Success',
        description: 'Dashboard duplicated successfully',
      });

      await fetchDashboards();
      return newDashboard;
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate dashboard',
        variant: 'destructive',
      });
      return null;
    }
  };

  const getDashboardById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('aeso_custom_dashboards')
        .select('*, aeso_dashboard_widgets(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  };

  const toggleStar = async (dashboardId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dashboard = dashboards.find(d => d.id === dashboardId);
      
      if (dashboard?.is_starred) {
        // Unstar
        const { error } = await supabase
          .from('dashboard_stars')
          .delete()
          .eq('dashboard_id', dashboardId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Star
        const { error } = await supabase
          .from('dashboard_stars')
          .insert({ dashboard_id: dashboardId, user_id: user.id });
        
        if (error) throw error;
      }

      await fetchDashboards();
      return true;
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const trackView = async (dashboardId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('dashboard_view_logs')
        .insert({ dashboard_id: dashboardId, user_id: user.id });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const updateTags = async (dashboardId: string, tags: string[]) => {
    try {
      // Delete existing tags
      await supabase
        .from('dashboard_tags')
        .delete()
        .eq('dashboard_id', dashboardId);

      // Insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          dashboard_id: dashboardId,
          tag,
        }));
        
        const { error } = await supabase
          .from('dashboard_tags')
          .insert(tagInserts);
        
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Tags updated successfully',
      });

      await fetchDashboards();
      return true;
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tags',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    dashboards,
    loading,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    getDashboardById,
    toggleStar,
    trackView,
    updateTags,
  };
};
