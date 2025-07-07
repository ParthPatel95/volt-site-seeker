-- Create some test data for VoltMarket messaging system
-- First create a test listing (if it doesn't exist)
INSERT INTO public.voltmarket_listings (
  id, seller_id, title, description, property_type, location, asking_price, power_capacity_mw
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT user_id FROM public.voltmarket_profiles LIMIT 1),
  'Test Energy Facility', 
  'Test facility for messaging demo',
  'industrial',
  'Austin, TX',
  5000000,
  50.0
WHERE NOT EXISTS (
  SELECT 1 FROM public.voltmarket_listings 
  WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid
);

-- Enable realtime for VoltMarket tables
ALTER TABLE public.voltmarket_messages REPLICA IDENTITY FULL;
ALTER TABLE public.voltmarket_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.voltmarket_profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_profiles;