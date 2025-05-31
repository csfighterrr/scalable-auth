-- Update RLS policies for user creation during registration
-- This script fixes the row-level security policy violation

-- First, drop the existing insert policy
DROP POLICY IF EXISTS "Auth service can create profiles" ON public.users;

-- Create a new policy that allows inserts for anon, authenticated, and service_role
CREATE POLICY "Auth service can create profiles"
  ON public.users
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Also ensure we have a policy that allows reading during auth operations
DROP POLICY IF EXISTS "Service can read for auth" ON public.users;
CREATE POLICY "Service can read for auth"
  ON public.users
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);
