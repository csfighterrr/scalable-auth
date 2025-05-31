-- Cleanup script to remove all existing users table policies and table
-- Run this BEFORE running create_users_table.sql

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.users;
DROP POLICY IF EXISTS "Auth service can create profiles" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- Drop indexes
DROP INDEX IF EXISTS public.users_email_idx;

-- Drop the table (this will remove all data!)
DROP TABLE IF EXISTS public.users;
