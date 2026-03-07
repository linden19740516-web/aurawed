// 创建一个临时脚本来初始化数据库表
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  try {
    // 创建 site_settings 表
    const { error } = await supabase.rpc('exec_sql', {
      statement: `
        CREATE TABLE IF NOT EXISTS site_settings (
          id BIGSERIAL PRIMARY KEY,
          setting_key VARCHAR(255) UNIQUE NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 启用 RLS
        ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

        -- 创建策略允许所有操作
        CREATE POLICY "Allow all operations on site_settings" ON site_settings
          FOR ALL USING (true) WITH CHECK (true);
      `
    });

    if (error) {
      console.log('Table might already exist or RPC not available, trying direct query...');

      // 尝试直接创建表
      const { error: createError } = await supabase.from('site_settings').select('*').limit(1);

      if (createError && createError.code === '42P01') {
        console.log('Table does not exist, please create it manually in Supabase dashboard');
        console.log('SQL: CREATE TABLE site_settings (id SERIAL PRIMARY KEY, setting_key VARCHAR(255) UNIQUE NOT NULL, setting_value TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())');
      } else if (!createError) {
        console.log('Table already exists!');
      } else {
        console.log('Error:', createError);
      }
    } else {
      console.log('Table created successfully!');
    }
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit(0);
}

createTable();
