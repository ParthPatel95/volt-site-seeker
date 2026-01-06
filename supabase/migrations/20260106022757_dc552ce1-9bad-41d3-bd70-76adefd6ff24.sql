-- Create table for VoltBuild approved users
CREATE TABLE public.voltbuild_approved_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.voltbuild_approved_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage VoltBuild approvals"
ON public.voltbuild_approved_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own VoltBuild approval"
ON public.voltbuild_approved_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to check VoltBuild access
CREATE OR REPLACE FUNCTION public.is_voltbuild_approved(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins always have access
  IF public.has_role(user_id, 'admin') THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.voltbuild_approved_users 
    WHERE voltbuild_approved_users.user_id = is_voltbuild_approved.user_id
  );
END;
$$;

-- Add current admin users to VoltBuild approved users
INSERT INTO public.voltbuild_approved_users (user_id, approved_by)
SELECT ur.user_id, ur.user_id
FROM public.user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;