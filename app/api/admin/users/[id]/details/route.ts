import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * 获取用户真实信息详情
 * GET /api/admin/users/[id]/details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    // 获取用户资料
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('获取用户资料失败:', profileError)
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    // 获取用户标签（从 user_tags 表或 profile 的 tags 字段）
    let tags: string[] = []
    if (profile.tags && Array.isArray(profile.tags)) {
      tags = profile.tags
    }

    // 获取用户生成的方案数量（从 weddings 表）
    const { count: plansCount, error: plansError } = await supabaseAdmin
      .from('weddings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      data: {
        real_name: profile.real_name || '',
        phone: profile.phone || '',
        tags: tags,
        generated_plans_count: plansCount || 0,
        created_at: profile.created_at
      }
    })
  } catch (error: any) {
    console.error('获取用户详情失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取失败' },
      { status: 500 }
    )
  }
}
