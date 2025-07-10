-- Fix the RLS policy for voltmarket_contact_messages
-- The current policy compares auth.uid() directly with listing_owner_id
-- But listing_owner_id references voltmarket_profiles.id, not auth user_id
-- So we need to join through the profiles table

-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Listing owners can view messages for their listings" ON voltmarket_contact_messages;

-- Create the correct policy that joins through voltmarket_profiles
CREATE POLICY "Listing owners can view messages for their listings" 
ON voltmarket_contact_messages 
FOR SELECT 
USING (
  listing_owner_id IN (
    SELECT id FROM voltmarket_profiles WHERE user_id = auth.uid()
  )
);