-- Instructions for Creating Your First Admin User
-- ================================================
-- Run this SQL in your Supabase SQL Editor AFTER you've created your admin account via the auth signup

-- Step 1: First, sign up for an account in the Supabase dashboard:
-- Go to: Authentication → Users → Add User
-- Enter your email and a secure password
-- Copy the UUID of the newly created user

-- Step 2: Run this SQL to promote your user to admin role:
-- Replace 'YOUR-USER-UUID-HERE' with the actual UUID from Step 1
-- Replace 'your-email@example.com' with your actual email

INSERT INTO admin_users (id, email, name, role, client_access)
VALUES (
  'YOUR-USER-UUID-HERE',  -- Replace with your auth.users UUID
  'your-email@example.com',  -- Replace with your email
  'Your Name',  -- Replace with your name
  'admin',  -- This makes you an admin (full access to all clients)
  '{}'  -- Admins don't need specific client_access (they see everything)
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', name = EXCLUDED.name;

-- Example for creating additional consultant users:
-- Consultants only see clients they're assigned to

-- INSERT INTO admin_users (id, email, name, role, client_access)
-- VALUES (
--   'CONSULTANT-UUID-HERE',
--   'consultant@example.com',
--   'Consultant Name',
--   'consultant',
--   ARRAY['client-uuid-1', 'client-uuid-2']  -- Array of client UUIDs they can access
-- );

-- To grant a consultant access to all demo clients:
-- UPDATE admin_users
-- SET client_access = ARRAY(SELECT id FROM clients WHERE client_slug = 'demo')
-- WHERE email = 'consultant@example.com';

-- To grant a consultant access to specific clients by slug:
-- UPDATE admin_users
-- SET client_access = ARRAY(SELECT id FROM clients WHERE client_slug IN ('client1', 'client2'))
-- WHERE email = 'consultant@example.com';
