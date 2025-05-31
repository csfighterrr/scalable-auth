const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    // Simple query to check connection
    console.log('Connecting to Supabase...');
    console.log(`URL: ${supabaseUrl.substr(0, 10)}...`);
    
    // Check if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    
    // Check if we can access the database
    try {
      console.log('Checking database access...');
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_tables');
      
      if (tablesError) {
        console.error('Error accessing database tables:', tablesError);
        console.log('No access to read database schema information.');
        console.log('\nPlease follow these steps to set up your table:');
        console.log('1. Go to your Supabase dashboard: https://app.supabase.com/');
        console.log('2. Select your project');
        console.log('3. Go to the SQL Editor');
        console.log('4. Create a new query');
        console.log('5. Paste the contents of create_users_table.sql');
        console.log('6. Click "Run"');
        return;
      }
      
      console.log('Database access confirmed!');
      console.log('Tables:', tablesData || 'No tables info available');
    } catch (dbErr) {
      console.log('Cannot check database schema. Using direct table check instead.');
      
      // Try to query the users table directly
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count(*)', { count: 'exact' })
          .limit(0);
        
        if (usersError) {
          if (usersError.code === '42P01') { // Table does not exist
            console.error('Users table does not exist. Please create it using the SQL editor.');
            console.log('\nPlease follow these steps to set up your table:');
            console.log('1. Go to your Supabase dashboard: https://app.supabase.com/');
            console.log('2. Select your project');
            console.log('3. Go to the SQL Editor');
            console.log('4. Create a new query');
            console.log('5. Paste the contents of create_users_table.sql');
            console.log('6. Click "Run"');
          } else {
            console.error('Error accessing users table:', usersError);
          }
        } else {
          console.log('Users table exists with', usersData?.count || 0, 'records');
          console.log('Database setup looks good!');
        }
      } catch (tableErr) {
        console.error('Error checking users table:', tableErr);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkConnection();
