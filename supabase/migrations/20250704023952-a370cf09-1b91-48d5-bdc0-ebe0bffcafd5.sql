-- Fix the watchlist RLS policy
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.voltmarket_watchlist;

-- Create a proper RLS policy for watchlist
CREATE POLICY "Users can manage own watchlist" 
ON public.voltmarket_watchlist 
FOR ALL 
USING (auth.uid() IN (
  SELECT voltmarket_profiles.user_id 
  FROM voltmarket_profiles 
  WHERE voltmarket_profiles.id = voltmarket_watchlist.user_id
));