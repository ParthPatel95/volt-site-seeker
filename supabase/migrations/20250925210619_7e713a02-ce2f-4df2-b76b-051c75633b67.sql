-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Insert sample profile for the current admin user
INSERT INTO public.profiles (id, email, full_name, phone, department, role, is_verified)
SELECT 
  '659d2108-b0be-45b4-b4ce-c0f1cf9bd428',
  'admin@voltscout.com',
  'System Administrator', 
  '+1-555-0101',
  'IT',
  'analyst',
  true
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  department = EXCLUDED.department,
  is_verified = EXCLUDED.is_verified;

-- Insert admin role for the current user
INSERT INTO public.user_roles (user_id, role)
SELECT '659d2108-b0be-45b4-b4ce-c0f1cf9bd428', 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert admin permissions
INSERT INTO public.user_permissions (user_id, permission)
SELECT '659d2108-b0be-45b4-b4ce-c0f1cf9bd428', permission
FROM unnest(ARRAY[
  'users.read', 'users.write', 'users.delete', 
  'analytics.read', 'analytics.export',
  'reports.read', 'reports.create',
  'listings.read', 'listings.write',
  'documents.read', 'documents.write'
]) AS permission
ON CONFLICT (user_id, permission) DO NOTHING;