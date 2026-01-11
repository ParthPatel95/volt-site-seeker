-- Sync existing users who have feature.build-management permission but are not in voltbuild_approved_users
INSERT INTO voltbuild_approved_users (user_id, approved_by, approved_at)
SELECT 
  up.user_id,
  (SELECT id FROM profiles WHERE email = 'admin@voltscout.com' LIMIT 1),
  NOW()
FROM user_permissions up
WHERE up.permission = 'feature.build-management'
  AND NOT EXISTS (
    SELECT 1 FROM voltbuild_approved_users vau WHERE vau.user_id = up.user_id
  );