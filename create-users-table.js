const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Initialize Supabase client with admin/service role key if available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL statement for creating users table
const createUsersTableSQL = `
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
CREATE POLICY IF NOT EXISTS "Users can view their own profiles" 
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profiles"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy for auth service to create users
CREATE POLICY IF NOT EXISTS "Auth service can create profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (true);  -- Adjust this based on your security requirements

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
`;

async function createUsersTable() {
  try {
    console.log('Creating users table in Supabase...');
    
    // Use Supabase's API to execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createUsersTableSQL });
    
    if (error) {
      console.error('Error creating users table:', error);
      // Fallback to direct query if RPC fails
      try {
        console.log('Trying direct SQL query...');
        const { data, error } = await supabase.from('_sql').select('*').execute(createUsersTableSQL);
        
        if (error) {
          console.error('Direct SQL query failed:', error);
          console.log('Please create the users table manually through the Supabase dashboard SQL editor');
          console.log('SQL to run:');
          console.log(createUsersTableSQL);
          process.exit(1);
        } else {
          console.log('Users table created successfully!');
        }
      } catch (directError) {
        console.error('Error with direct SQL:', directError);
        console.log('Please create the users table manually through the Supabase dashboard SQL editor');
        console.log('SQL to run:');
        console.log(createUsersTableSQL);
        process.exit(1);
      }
    } else {
      console.log('Users table created successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    console.log('Please create the users table manually through the Supabase dashboard SQL editor');
    console.log('SQL to run:');
    console.log(createUsersTableSQL);
    process.exit(1);
  }
}

createUsersTable();
