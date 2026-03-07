import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * 获取当前策划师的作品集列表
 * GET /api/planner/portfolios
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户权限
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证是否是策划师
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single() as any

    if (!profile || profile.user_type !== 'planner') {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 })
    }

    // 2. 获取该策划师的所有作品集
    const { data: portfolios, error } = await supabase
      .from('planner_portfolios')
      .select('*')
      .eq('planner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      portfolios: portfolios || []
    })

  } catch (error: any) {
    console.error('获取作品集失败:', error)
    return NextResponse.json(
      { error: error.message || '获取作品集失败' },
      { status: 500 }
    )
  }
}

/**
 * 创建新的作品集
 * POST /api/planner/portfolios
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户权限
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 验证是否是策划师
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single() as any

    if (!profile || profile.user_type !== 'planner') {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 })
    }

    // 2. 解析请求体
    const body = await request.json()
    const {
      title,
      description,
      cover_image,
      images,
      wedding_style,
      city,
      venue_type,
      budget_range,
      guest_count,
      is_public = true
    } = body

    // 3. 验证必填字段
    if (!title) {
      return NextResponse.json({ error: '请填写作品标题' }, { status: 400 })
    }

    // 4. 创建作品集
    const { data: portfolio, error } = await supabase
      .from('planner_portfolios')
      .insert({
        planner_id: user.id,
        title,
        description,
        cover_image,
        images: images || [],
        wedding_style,
        city,
        venue_type,
        budget_range,
        guest_count,
        is_public,
        likes_count: 0,
        views_count: 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      portfolio
    })

  } catch (error: any) {
    console.error('创建作品集失败:', error)
    return NextResponse.json(
      { error: error.message || '创建作品集失败' },
      { status: 500 }
    )
  }
}
