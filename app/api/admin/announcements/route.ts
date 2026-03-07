import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * 获取公告列表
 * GET /api/admin/announcements
 */
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('获取公告列表失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/**
 * 创建公告
 * POST /api/admin/announcements
 */
export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { title, content, is_active, scheduled_at } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: title, content' },
        { status: 400 }
      )
    }

    // 处理定时发布
    let publishAt = new Date()
    if (scheduled_at) {
      publishAt = new Date(scheduled_at)
    }

    // 如果设置了定时发布时间且还未到时间，则不立即发布
    const shouldBeActive = is_active && (!scheduled_at || publishAt <= new Date())

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        content,
        is_active: shouldBeActive,
        scheduled_at: scheduled_at || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('创建公告失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/**
 * 更新公告
 * PUT /api/admin/announcements?id=xxx
 */
export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少公告ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, is_active, scheduled_at } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (is_active !== undefined) updateData.is_active = is_active
    if (scheduled_at !== undefined) {
      updateData.scheduled_at = scheduled_at
      // 如果设置了定时发布时间且还未到时间，则不立即发布
      if (scheduled_at && new Date(scheduled_at) > new Date()) {
        updateData.is_active = false
      }
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('更新公告失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/**
 * 删除公告
 * DELETE /api/admin/announcements?id=xxx
 */
export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少公告ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除公告失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
