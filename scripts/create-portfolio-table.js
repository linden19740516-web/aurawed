// 执行 SQL 创建作品集表
// 使用方法: node scripts/create-portfolio-table.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPortfolioTable() {
  console.log('开始创建作品集表...\n');

  try {
    // 检查表是否已存在
    const { data: tableCheck, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'planner_portfolios');

    if (checkError) {
      console.log('检查表时出错:', checkError.message);
    }

    if (tableCheck && tableCheck.length > 0) {
      console.log('✓ 表 planner_portfolios 已存在，跳过创建');
    console.log('需要 } else {
     创建表 planner_portfolios');
      console.log('\n请在 Supabase SQL Editor 中执行以下 SQL:\n');

      const sql = `
-- 12. 策划师作品集表
CREATE TABLE IF NOT EXISTS planner_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    images TEXT[],
    wedding_style TEXT,
    city TEXT,
    venue_type TEXT,
    budget_range TEXT,
    guest_count INTEGER,
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_planner_portfolios_planner ON planner_portfolios(planner_id);
CREATE INDEX IF NOT EXISTS idx_planner_portfolios_public ON planner_portfolios(planner_id, is_public);

-- RLS
ALTER TABLE planner_portfolios ENABLE ROW LEVEL SECURITY;

-- 策略
DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON planner_portfolios;
DROP POLICY IF EXISTS "Planners can manage own portfolios" ON planner_portfolios;

CREATE POLICY "Public portfolios are viewable by everyone" ON planner_portfolios
    FOR SELECT USING (is_public = true);

CREATE POLICY "Planners can manage own portfolios" ON planner_portfolios
    FOR ALL USING (auth.uid() = planner_id);
      `;

      console.log(sql);
    }

    console.log('\n完成!');
  } catch (error) {
    console.error('错误:', error);
  }
}

createPortfolioTable();
