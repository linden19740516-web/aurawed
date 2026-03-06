import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * 获取当前策划师负责的项目
 * GET /api/planner/projects
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
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'planner') {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 })
    }

    // 2. 从数据库获取分配给该策划师的婚礼项目
    const { data: weddingsData, error: weddingsError } = await supabase
      .from('weddings')
      .select(`
        id,
        name,
        status,
        created_at,
        updated_at,
        couple:couple_id(name)
      `)
      .eq('planner_id', user.id)
      .order('updated_at', { ascending: false })

    if (weddingsError) {
      throw weddingsError
    }

    // 3. 格式化数据以适应前端需求
    const formattedProjects = weddingsData.map((w: any) => ({
      id: w.id,
      name: w.name || '未命名项目',
      clientName: w.couple?.name || '未知客户',
      status: w.status || 'draft',
      createdAt: new Date(w.created_at).toLocaleDateString(),
      updatedAt: new Date(w.updated_at).toLocaleDateString(),
      tags: ['AI生成', '定制方案'],
    }))

    return NextResponse.json({
      success: true,
      projects: formattedProjects
    })

  } catch (error: any) {
    console.error('获取策划师项目失败:', error)
    return NextResponse.json(
      { error: error.message || '获取项目失败' },
      { status: 500 }
    )
  }
}
