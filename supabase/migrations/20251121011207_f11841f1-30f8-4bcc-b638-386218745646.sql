-- Add Energy Dashboards permission to admin user
INSERT INTO user_permissions (user_id, permission)
SELECT id, 'feature.energy-dashboards'
FROM auth.users
WHERE email = 'admin@voltscout.com'
ON CONFLICT (user_id, permission) DO NOTHING;