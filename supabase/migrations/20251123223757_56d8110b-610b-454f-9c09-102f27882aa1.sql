-- Fix search_path security issue for the view count function
-- Drop trigger first, then function
DROP TRIGGER IF EXISTS increment_dashboard_views ON dashboard_view_logs;
DROP FUNCTION IF EXISTS update_dashboard_view_count();

CREATE OR REPLACE FUNCTION update_dashboard_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE aeso_custom_dashboards
  SET view_count = view_count + 1
  WHERE id = NEW.dashboard_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate trigger
CREATE TRIGGER increment_dashboard_views
  AFTER INSERT ON dashboard_view_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_view_count();