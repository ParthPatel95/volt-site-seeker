-- Fix the get_all_users_with_details function to properly return user data
DROP FUNCTION IF EXISTS public.get_all_users_with_details();

CREATE OR REPLACE FUNCTION public.get_all_users_with_details()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  phone text,
  department text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_login timestamp with time zone,
  is_active boolean,
  is_verified boolean,
  roles text[],
  permissions text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.department,
    p.created_at,
    p.updated_at,
    p.last_login,
    p.is_active,
    p.is_verified,
    COALESCE(ARRAY_AGG(DISTINCT ur.role::text) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) as roles,
    COALESCE(ARRAY_AGG(DISTINCT up.permission) FILTER (WHERE up.permission IS NOT NULL), ARRAY[]::text[]) as permissions
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_permissions up ON p.id = up.user_id
  GROUP BY p.id, p.email, p.full_name, p.phone, p.department, p.created_at, p.updated_at, p.last_login, p.is_active, p.is_verified
  ORDER BY p.created_at DESC;
END;
$$;