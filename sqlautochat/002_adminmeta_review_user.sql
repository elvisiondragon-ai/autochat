-- ================================================
-- Meta App Review Test User: adminmeta
-- Run this in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-05
--
-- This creates a demo account for Meta reviewers:
--   Email   : adminmeta@autochat.elvisiongroup.com
--   Password : adminmeta
-- ================================================

-- Step 1: Create auth user (run in Supabase Auth → Add User, OR use this SQL)
-- NOTE: Supabase does not allow plain SQL INSERT to auth.users for passwords.
-- Use the Supabase Dashboard → Authentication → Users → "Add User" button:
--   Email    : adminmeta@autochat.elvisiongroup.com
--   Password : adminmeta
--   ✓ Auto-confirm email

-- Step 2: After creating the auth user above, run this to seed autochat_clients:
INSERT INTO public.autochat_clients (
  user_id,
  email,
  display_name,
  phone_number,
  status
)
SELECT
  id,
  'adminmeta@autochat.elvisiongroup.com',
  'Meta Reviewer Demo',
  NULL,
  'paid'  -- give reviewer paid status so they see all features
FROM auth.users
WHERE email = 'adminmeta@autochat.elvisiongroup.com'
ON CONFLICT (user_id) DO UPDATE
  SET display_name = 'Meta Reviewer Demo',
      status       = 'paid';

-- ================================================
-- VERIFY: check user was created properly
-- ================================================
SELECT
  ac.email,
  ac.display_name,
  ac.status,
  u.email_confirmed_at
FROM public.autochat_clients ac
JOIN auth.users u ON u.id = ac.user_id
WHERE ac.email = 'adminmeta@autochat.elvisiongroup.com';
