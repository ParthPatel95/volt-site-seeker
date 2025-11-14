-- Enable realtime for aeso_retraining_schedule table
ALTER TABLE aeso_retraining_schedule REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE aeso_retraining_schedule;