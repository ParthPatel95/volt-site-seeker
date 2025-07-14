-- Get the user ID for admin@voltscout.com and add them to voltscout_approved_users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find the user ID for admin@voltscout.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@voltscout.com';
    
    -- If user exists, add them to approved users (if not already added)
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.voltscout_approved_users (user_id, notes)
        VALUES (admin_user_id, 'Admin user - granted access via migration')
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Added admin@voltscout.com (%) to VoltScout approved users', admin_user_id;
    ELSE
        RAISE NOTICE 'User admin@voltscout.com not found in auth.users table';
    END IF;
END $$;