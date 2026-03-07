import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * 获取可配置标签（公开接口）
 * GET /api/tags?types=personal,color,venue,season,style
 * 或 GET /api/tags?type=personal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const types = searchParams.get('types')

    // 使用 anon key 创建客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    let query = supabase
      .from('configurable_tags')
      .select('id, tag_type, tag_name, sort_order')
      .eq('is_active', true)
      .order('tag_type', { ascending: true })
      .order('sort_order', { ascending: true })

    // 支持单个类型或多个类型
    if (type) {
      query = query.eq('tag_type', type)
    } else if (types) {
      const typeList = types.split(',').map(t => t.trim()).filter(t => t)
      if (typeList.length > 0) {
        query = query.in('tag_type', typeList)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('获取标签失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 按类型分组
    const grouped: Record<string, string[]> = {}
    if (data) {
      for (const tag of data) {
        if (!grouped[tag.tag_type]) {
          grouped[tag.tag_type] = []
        }
        grouped[tag.tag_type].push(tag.tag_name)
      }
    }

    return NextResponse.json({ success: true, data, grouped })
  } catch (error: any) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取失败' },
      { status: 500 }
    )
  }
}
