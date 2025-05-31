
-- Cleanup existing policies and table (optional - uncomment if you want to start fresh)
-- DROP POLICY IF EXISTS "Users can view their own profiles" ON public.users;
-- DROP POLICY IF EXISTS "Users can update their own profiles" ON public.users;
-- DROP POLICY IF EXISTS "Auth service can create profiles" ON public.users;
-- DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
-- DROP INDEX IF EXISTS public.users_email_idx;
-- DROP TABLE IF EXISTS public.users;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can view their own profiles" 
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profiles"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy for auth service to create users
CREATE POLICY "Auth service can create profiles"
  ON public.users
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Policy for service role to manage users
CREATE POLICY "Service role can manage users"
  ON public.users
  FOR ALL
  TO service_role
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
