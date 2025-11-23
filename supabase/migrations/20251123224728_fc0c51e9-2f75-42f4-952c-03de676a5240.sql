-- Create dashboard comments table
CREATE TABLE IF NOT EXISTS public.dashboard_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  widget_id VARCHAR(255),
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  mentioned_users UUID[] DEFAULT '{}',
  parent_comment_id UUID REFERENCES dashboard_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false
);

-- Create dashboard versions table
CREATE TABLE IF NOT EXISTS public.dashboard_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dashboard_snapshot JSONB NOT NULL,
  widgets_snapshot JSONB NOT NULL,
  change_description TEXT,
  UNIQUE(dashboard_id, version_number)
);

-- Create dashboard activity log table
CREATE TABLE IF NOT EXISTS public.dashboard_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard collaborators table
CREATE TABLE IF NOT EXISTS public.dashboard_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES aeso_custom_dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  added_by UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dashboard_id, user_id)
);

-- Enable RLS
ALTER TABLE public.dashboard_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for dashboard_comments
CREATE POLICY "Users can view comments on dashboards they have access to"
  ON public.dashboard_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM dashboard_collaborators
        WHERE dashboard_id = aeso_custom_dashboards.id 
        AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can create comments on dashboards they have access to"
  ON public.dashboard_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM dashboard_collaborators
        WHERE dashboard_id = aeso_custom_dashboards.id 
        AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.dashboard_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.dashboard_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for dashboard_versions
CREATE POLICY "Users can view versions of dashboards they have access to"
  ON public.dashboard_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM dashboard_collaborators
        WHERE dashboard_id = aeso_custom_dashboards.id 
        AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "System can create versions"
  ON public.dashboard_versions FOR INSERT
  WITH CHECK (true);

-- Policies for dashboard_activity_log
CREATE POLICY "Users can view activity on dashboards they have access to"
  ON public.dashboard_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id 
      AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM dashboard_collaborators
        WHERE dashboard_id = aeso_custom_dashboards.id 
        AND user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can log their own activities"
  ON public.dashboard_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for dashboard_collaborators
CREATE POLICY "Anyone can view collaborators"
  ON public.dashboard_collaborators FOR SELECT
  USING (true);

CREATE POLICY "Dashboard owners can manage collaborators"
  ON public.dashboard_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM aeso_custom_dashboards
      WHERE id = dashboard_id AND created_by = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_dashboard_comments_dashboard_id ON public.dashboard_comments(dashboard_id);
CREATE INDEX idx_dashboard_comments_user_id ON public.dashboard_comments(user_id);
CREATE INDEX idx_dashboard_comments_widget_id ON public.dashboard_comments(widget_id);
CREATE INDEX idx_dashboard_comments_created_at ON public.dashboard_comments(created_at DESC);
CREATE INDEX idx_dashboard_versions_dashboard_id ON public.dashboard_versions(dashboard_id);
CREATE INDEX idx_dashboard_versions_version ON public.dashboard_versions(dashboard_id, version_number DESC);
CREATE INDEX idx_dashboard_activity_dashboard_id ON public.dashboard_activity_log(dashboard_id);
CREATE INDEX idx_dashboard_activity_created_at ON public.dashboard_activity_log(created_at DESC);
CREATE INDEX idx_dashboard_collaborators_dashboard_id ON public.dashboard_collaborators(dashboard_id);
CREATE INDEX idx_dashboard_collaborators_user_id ON public.dashboard_collaborators(user_id);

-- Create function to update comment updated_at
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Create trigger
CREATE TRIGGER update_dashboard_comments_updated_at
  BEFORE UPDATE ON dashboard_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();

-- Create function to auto-create version on dashboard update
CREATE OR REPLACE FUNCTION create_dashboard_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO next_version
  FROM dashboard_versions
  WHERE dashboard_id = NEW.id;
  
  -- Create version snapshot
  INSERT INTO dashboard_versions (
    dashboard_id,
    version_number,
    created_by,
    dashboard_snapshot,
    widgets_snapshot,
    change_description
  )
  SELECT 
    NEW.id,
    next_version,
    auth.uid(),
    to_jsonb(NEW),
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(w))
       FROM aeso_dashboard_widgets w
       WHERE w.dashboard_id = NEW.id),
      '[]'::jsonb
    ),
    'Dashboard updated';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Create trigger for version control
CREATE TRIGGER create_dashboard_version_on_update
  AFTER UPDATE ON aeso_custom_dashboards
  FOR EACH ROW
  WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION create_dashboard_version();

-- Enable realtime for comments and activity
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_activity_log;