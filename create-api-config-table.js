const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS api_config (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        platform VARCHAR(255) UNIQUE NOT NULL,
        encrypted_key TEXT NOT NULL,
        iv TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Set up RLS
      ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
      
      -- Only service role can access this table
      CREATE POLICY "Service role can do all" ON api_config
        FOR ALL USING (auth.role() = 'service_role');
    `
  });
  
  if (error) {
    console.log('Error creating table via RPC, maybe execute_sql not available.', error);
    // If we can't execute SQL, we can create a file and ask the user to run it.
  } else {
    console.log('Table created successfully:', data);
  }
}

createTable();
