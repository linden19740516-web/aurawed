import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 初始化 Supabase 管理员客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 默认网站设置
const DEFAULT_SETTINGS = {
  brand_name: 'AuraWed',
  hero_tagline: 'AI 驱动的婚礼美学革命',
  hero_title_1: '让婚礼',
  hero_title_2: '成为一生的故事',
  hero_subtitle_1: '拒绝同质化堆砌，用心理学构建具有叙事感的婚礼方案',
  hero_subtitle_2: '让每一个瞬间都充满意义',
  couple_title: '新人入口',
  couple_description: '开启一场沉浸式婚礼探索之旅，通过心理学故事发现您独一无二的婚礼美学',
  couple_button: '开始探索',
  planner_title: '策划师入口',
  planner_description: '专业级美学提案引擎，为您的客户提供独特且富有叙事感的高级婚礼方案',
  planner_button: '专业入驻',
  portfolio_button: '浏览优秀作品',
  feature_1_title: 'AI 智能故事引擎',
  feature_1_desc: '心理学驱动的需求挖掘',
  feature_2_title: '独特美学标签',
  feature_2_desc: '拒绝流水线式方案',
  feature_3_title: 'B/C 端协同',
  feature_3_desc: '新人与策划师的高效对接'
}

// GET /api/site-settings - 获取网站设置（公开接口）
export async function GET() {
  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key', { ascending: true })

    if (error || !data || data.length === 0) {
      // 返回默认设置
      return NextResponse.json({ success: true, data: DEFAULT_SETTINGS, isDefault: true })
    }

    // 转换为 key-value 格式
    const settings: any = {}
    data.forEach((item: any) => {
      settings[item.setting_key] = item.setting_value
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    console.error('获取网站设置失败:', error)
    // 返回默认设置
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS, isDefault: true })
  }
}
