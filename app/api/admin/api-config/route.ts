import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 管理员客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// API 格式类型
type ApiFormat = 'openai' | 'anthropic'

// 平台列表（默认配置）
const DEFAULT_PLATFORMS = [
  { platform_name: 'gemini', display_name: 'Google Gemini', api_base_url: 'https://generativelanguage.googleapis.com/v1beta', api_format: 'openai' },
  { platform_name: 'openai', display_name: 'OpenAI', api_base_url: 'https://api.openai.com/v1', api_format: 'openai' },
  { platform_name: 'anthropic', display_name: 'Anthropic Claude', api_base_url: 'https://api.anthropic.com', api_format: 'anthropic' },
  { platform_name: 'minimax', display_name: 'MiniMax', api_base_url: 'https://api.minimax.chat/v1', api_format: 'openai' },
  { platform_name: 'feishu', display_name: '飞书 Webhook', api_base_url: '', api_format: 'openai' }
]

// 初始化默认平台配置
async function initializePlatforms(supabase: any) {
  try {
    for (const platform of DEFAULT_PLATFORMS) {
      const { error } = await supabase
        .from('api_config')
        .upsert({
          platform_name: platform.platform_name,
          display_name: platform.display_name,
          api_base_url: platform.api_base_url,
          api_format: platform.api_format,
          is_active: platform.platform_name === 'gemini', // 默认启用 Gemini
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'platform_name'
        })

      if (error) {
        console.log(`初始化平台 ${platform.platform_name} 失败:`, error.message)
      }
    }
  } catch (e) {
    console.log('initializePlatforms error:', e)
  }
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
    // 尝试初始化平台配置
    try {
      await initializePlatforms(supabase)
    } catch (e) {
      // 忽略初始化错误
    }

    const { data, error } = await supabase
      .from('api_config')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    // 不返回实际 API key，只返回是否已设置
    const configs = data.map((config: any) => ({
      id: config.id,
      platform_name: config.platform_name,
      display_name: config.display_name,
      api_key_set: !!config.api_key && config.api_key.length > 0,
      api_base_url: config.api_base_url || '',
      api_format: config.api_format || 'openai',
      available_models: config.available_models || '',
      is_active: config.is_active !== false,
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
    const { id, platform_name, api_key, api_base_url, api_format, available_models, is_active, is_first_view } = body

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
    if (api_base_url !== undefined) updateData.api_base_url = api_base_url
    if (api_format !== undefined) updateData.api_format = api_format
    if (available_models !== undefined) updateData.available_models = available_models
    if (is_active !== undefined) updateData.is_active = is_active
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
        display_name: data.display_name,
        api_key_set: !!data.api_key && data.api_key.length > 0,
        api_base_url: data.api_base_url || '',
        api_format: data.api_format || 'openai',
        available_models: data.available_models || '',
        is_active: data.is_active !== false,
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

// 测试 API 连接
// POST /api/admin/api-config/test
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key, api_base_url, api_format, platform_name } = body

    if (!api_key || !api_base_url) {
      return NextResponse.json(
        { success: false, error: '缺少 API Key 或 Base URL' },
        { status: 400 }
      )
    }

    // 根据不同的 API 格式进行测试
    let testResult = { success: false, message: '' }

    if (platform_name === 'feishu') {
      // 飞书 Webhook 测试
      try {
        const response = await fetch(api_base_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: '测试消息' })
        })
        if (response.ok) {
          testResult = { success: true, message: '连接成功' }
        } else {
          testResult = { success: false, message: `连接失败: ${response.status}` }
        }
      } catch (e: any) {
        testResult = { success: false, message: e.message }
      }
    } else {
      // OpenAI 兼容格式测试
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        if (api_format === 'anthropic') {
          headers['x-api-key'] = api_key
          headers['anthropic-version'] = '2023-06-01'
        } else {
          headers['Authorization'] = `Bearer ${api_key}`
        }

        // 尝试获取模型列表
        const modelsUrl = api_base_url.replace(/\/$/, '') + '/models'
        const response = await fetch(modelsUrl, {
          method: 'GET',
          headers
        })

        if (response.ok) {
          const data = await response.json()
          const modelCount = data.data?.length || 0
          testResult = { success: true, message: `连接成功，可用模型: ${modelCount} 个` }
        } else {
          const errorText = await response.text()
          testResult = { success: false, message: `连接失败: ${response.status} - ${errorText.slice(0, 100)}` }
        }
      } catch (e: any) {
        testResult = { success: false, message: e.message }
      }
    }

    return NextResponse.json(testResult)
  } catch (error: any) {
    console.error('测试连接失败:', error)
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
