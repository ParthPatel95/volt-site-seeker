-- Enable realtime for due_diligence_reports table
ALTER TABLE public.due_diligence_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.due_diligence_reports;