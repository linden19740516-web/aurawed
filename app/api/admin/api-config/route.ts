import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 管理员客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 验证管理员请求
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return { error: '未授权', status: 401 }
  }

  // 这里可以添加更严格的管理员验证
  // 暂时简单验证
  return { error: null, status: 200 }
}

// GET /api/admin/api-config - 获取所有 API 配置
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('api_config')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    // 不返回实际 API key，只返回是否已设置
    const configs = data.map((config: any) => ({
      id: config.id,
      platform_name: config.platform_name,
      api_key_set: !!config.api_key && config.api_key.length > 0,
      is_first_view: config.is_first_view,
      created_at: config.created_at,
      updated_at: config.updated_at
    }))

    return NextResponse.json({ success: true, data: configs })
  } catch (error: any) {
    console.error('获取 API 配置失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/api-config - 更新 API 配置
export async function PUT(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }

  const supabase = getSupabaseAdmin()

  try {
    const body = await request.json()
    const { id, platform_name, api_key, is_first_view } = body

    if (!id && !platform_name) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (api_key !== undefined) updateData.api_key = api_key
    if (is_first_view !== undefined) updateData.is_first_view = is_first_view

    let query = supabase.from('api_config')

    if (id) {
      query = query.update(updateData).eq('id', id)
    } else if (platform_name) {
      query = query.update(updateData).eq('platform_name', platform_name)
    }

    const { data, error } = await query.select().single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        platform_name: data.platform_name,
        api_key_set: !!data.api_key && data.api_key.length > 0,
        is_first_view: data.is_first_view
      }
    })
  } catch (error: any) {
    console.error('更新 API 配置失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/admin/api-config - 创建新 API 配置
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }

  const supabase = getSupabaseAdmin()

  try {
    const body = await request.json()
    const { platform_name, api_key, is_first_view } = body

    if (!platform_name || !api_key) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: platform_name, api_key' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('api_config')
      .insert({
        platform_name,
        api_key,
        is_first_view: is_first_view ?? false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        platform_name: data.platform_name,
        api_key_set: true,
        is_first_view: data.is_first_view
      }
    })
  } catch (error: any) {
    console.error('创建 API 配置失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/api-config - 删除 API 配置
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  }

  const supabase = getSupabaseAdmin()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少参数: id' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('api_config')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除 API 配置失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
