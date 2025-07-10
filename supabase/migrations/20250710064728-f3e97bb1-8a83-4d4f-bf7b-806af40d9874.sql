-- Create a table to track VoltScout approved users
CREATE TABLE public.voltscout_approved_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.voltscout_approved_users ENABLE ROW LEVEL SECURITY;

-- Only admins can manage approved users (for now, allow all authenticated users to manage)
CREATE POLICY "Authenticated users can manage voltscout approvals" 
ON public.voltscout_approved_users 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create a function to check if a user is approved for VoltScout
CREATE OR REPLACE FUNCTION public.is_voltscout_approved(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.voltscout_approved_users 
    WHERE voltscout_approved_users.user_id = is_voltscout_approved.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;