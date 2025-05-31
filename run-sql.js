const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function runSQL() {
  try {
    // Check if the users table exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table does not exist error
      console.log('Users table does not exist. You need to create it.');
      console.log('Please use the Supabase Dashboard to run the SQL in create_users_table.sql.');
      
      // Print the SQL for convenience
      const sqlPath = path.join(__dirname, 'create_users_table.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log('\n--- SQL to run in Supabase SQL Editor ---');
      console.log(sql);
      
      console.log('\nInstructions:');
      console.log('1. Go to your Supabase dashboard: https://app.supabase.com/');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Paste the above SQL');
      console.log('6. Click "Run"');
    } else if (error) {
      console.error('Error checking users table:', error);
    } else {
      console.log('Users table exists!');
      console.log(data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runSQL();
