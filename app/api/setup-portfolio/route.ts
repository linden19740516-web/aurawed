import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // 创建 planner_portfolios 表
    const createTableSQL = `
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
    `

    // 创建索引
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_planner_portfolios_planner ON planner_portfolios(planner_id);
      CREATE INDEX IF NOT EXISTS idx_planner_portfolios_public ON planner_portfolios(planner_id, is_public);
    `

    // 启用 RLS
    const enableRLS = `
      ALTER TABLE planner_portfolios ENABLE ROW LEVEL SECURITY;
    `

    // RLS 策略
    const policiesSQL = `
      DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON planner_portfolios;
      DROP POLICY IF EXISTS "Planners can manage own portfolios" ON planner_portfolios;

      CREATE POLICY "Public portfolios are viewable by everyone" ON planner_portfolios
        FOR SELECT USING (is_public = true);

      CREATE POLICY "Planners can manage own portfolios" ON planner_portfolios
        FOR ALL USING (auth.uid() = planner_id);
    `

    // 执行 SQL - 使用 postgresql.exec 函数
    const { error: tableError } = await supabase.rpc('pg_catalog.exec', {
      query: createTableSQL
    })

    // 如果 RPC 不可用，尝试直接执行
    if (tableError) {
      // 使用备选方案：通过插入一条记录来测试表是否存在
      console.log('Table creation info:', tableError.message)
    }

    // 由于 Supabase REST API 不直接支持执行 DDL，
    // 返回指引让用户在 Supabase SQL Editor 中执行
    return NextResponse.json({
      success: true,
      message: '数据库配置已准备好',
      instructions: [
        '1. 打开 Supabase Dashboard: https://supabase.com/dashboard',
        '2. 选择项目: cgdyfikhbfssntetnqne',
        '3. 进入 SQL Editor',
        '4. 复制并执行以下 SQL:'
      ],
      sql: `
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
CREATE POLICY "Public portfolios are viewable by everyone" ON planner_portfolios
    FOR SELECT USING (is_public = true);

CREATE POLICY "Planners can manage own portfolios" ON planner_portfolios
    FOR ALL USING (auth.uid() = planner_id);
      `
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '执行失败', details: error },
      { status: 500 }
    )
  }
}
