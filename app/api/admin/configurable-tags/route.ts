import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// 允许的标签类型
const ALLOWED_TAG_TYPES = ['personal', 'color', 'venue', 'season', 'style']

/**
 * 获取所有标签
 * GET /api/admin/configurable-tags
 * GET /api/admin/configurable-tags?type=personal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    let query = supabaseAdmin
      .from('configurable_tags')
      .select('*')
      .order('tag_type', { ascending: true })
      .order('sort_order', { ascending: true })

    if (type && ALLOWED_TAG_TYPES.includes(type)) {
      query = query.eq('tag_type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取标签失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取失败' },
      { status: 500 }
    )
  }
}

/**
 * 创建新标签
 * POST /api/admin/configurable-tags
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    const body = await request.json()

    const { tag_type, tag_name, is_active, sort_order } = body

    // 验证必填字段
    if (!tag_type || !tag_name) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 })
    }

    // 验证标签类型
    if (!ALLOWED_TAG_TYPES.includes(tag_type)) {
      return NextResponse.json({ success: false, error: '无效的标签类型' }, { status: 400 })
    }

    // 获取当前最大的 sort_order
    const { data: maxOrder } = await supabaseAdmin
      .from('configurable_tags')
      .select('sort_order')
      .eq('tag_type', tag_type)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const newSortOrder = sort_order ?? (maxOrder?.sort_order ?? 0) + 1

    const { data, error } = await supabaseAdmin
      .from('configurable_tags')
      .insert({
        tag_type,
        tag_name: tag_name.trim(),
        is_active: is_active !== false,
        sort_order: newSortOrder
      })
      .select()
      .single()

    if (error) {
      // 处理唯一约束冲突
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '该标签已存在' }, { status: 400 })
      }
      console.error('创建标签失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('创建标签失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建失败' },
      { status: 500 }
    )
  }
}

/**
 * 更新标签
 * PUT /api/admin/configurable-tags?id=xxx
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少标签ID' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    const body = await request.json()

    const { tag_name, is_active, sort_order } = body

    // 构建更新对象
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (tag_name !== undefined) {
      updateData.tag_name = tag_name.trim()
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active
    }
    if (sort_order !== undefined) {
      updateData.sort_order = sort_order
    }

    const { data, error } = await supabaseAdmin
      .from('configurable_tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // 处理唯一约束冲突
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '该标签已存在' }, { status: 400 })
      }
      console.error('更新标签失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('更新标签失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新失败' },
      { status: 500 }
    )
  }
}

/**
 * 删除标签
 * DELETE /api/admin/configurable-tags?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少标签ID' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 })
    }

    const { error } = await supabaseAdmin
      .from('configurable_tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除标签失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除标签失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除失败' },
      { status: 500 }
    )
  }
}
