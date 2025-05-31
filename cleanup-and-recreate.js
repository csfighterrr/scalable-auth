const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables or set your Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQLFile(filename) {
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Running ${filename}...`);
    
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement: ${error.message}`);
        } else {
          console.log('✓ Statement executed successfully');
        }
      }
    }
    
    console.log(`✓ ${filename} completed`);
  } catch (error) {
    console.error(`Error running ${filename}:`, error.message);
  }
}

async function cleanupAndRecreate() {
  console.log('Starting cleanup and recreation process...');
  
  // Run cleanup first
  await runSQLFile('cleanup_users_table.sql');
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run creation script
  await runSQLFile('create_users_table.sql');
  
  console.log('Process completed!');
}

// Run if called directly
if (require.main === module) {
  cleanupAndRecreate();
}

module.exports = { runSQLFile, cleanupAndRecreate };
