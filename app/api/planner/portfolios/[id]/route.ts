import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * 获取单个作品集详情 / 更新 / 删除
 * GET /api/planner/portfolios/[id]
 * PUT /api/planner/portfolios/[id]
 * DELETE /api/planner/portfolios/[id]
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = params

    // 获取作品集
    const { data: portfolio, error } = await supabase
      .from('planner_portfolios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    // 检查权限（必须是作品集所有者）
    if (portfolio.planner_id !== user.id) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 })
    }

    // 增加浏览次数
    await supabase
      .from('planner_portfolios')
      .update({ views_count: portfolio.views_count + 1 })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      portfolio
    })

  } catch (error: any) {
    console.error('获取作品集详情失败:', error)
    return NextResponse.json(
      { error: error.message || '获取作品集详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // 检查作品集是否存在且属于当前用户
    const { data: existing, error: checkError } = await supabase
      .from('planner_portfolios')
      .select('planner_id')
      .eq('id', id)
      .single()

    if (checkError) {
      throw checkError
    }

    if (existing.planner_id !== user.id) {
      return NextResponse.json({ error: '无权限修改' }, { status: 403 })
    }

    // 更新作品集
    const { data: portfolio, error } = await supabase
      .from('planner_portfolios')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
    console.error('更新作品集失败:', error)
    return NextResponse.json(
      { error: error.message || '更新作品集失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = params

    // 检查作品集是否存在且属于当前用户
    const { data: existing, error: checkError } = await supabase
      .from('planner_portfolios')
      .select('planner_id')
      .eq('id', id)
      .single()

    if (checkError) {
      throw checkError
    }

    if (existing.planner_id !== user.id) {
      return NextResponse.json({ error: '无权限删除' }, { status: 403 })
    }

    // 删除作品集
    const { error } = await supabase
      .from('planner_portfolios')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '作品集已删除'
    })

  } catch (error: any) {
    console.error('删除作品集失败:', error)
    return NextResponse.json(
      { error: error.message || '删除作品集失败' },
      { status: 500 }
    )
  }
}
