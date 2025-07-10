-- Also fix the UPDATE policy for consistency
DROP POLICY IF EXISTS "Listing owners can update message read status" ON voltmarket_contact_messages;

CREATE POLICY "Listing owners can update message read status" 
ON voltmarket_contact_messages 
FOR UPDATE 
USING (
  listing_owner_id IN (
    SELECT id FROM voltmarket_profiles WHERE user_id = auth.uid()
  )
);