import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 获取管理员控制台所需的数据
 * GET /api/admin/dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 在生产环境中，这里应该添加管理员权限验证
    // 目前为了方便测试直接跳过严格鉴权

    // 1. 获取所有用户资料
    const { data: allUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')

    if (usersError) throw usersError

    const allUsersData = allUsers || []
    const plannersData = allUsersData.filter((u: any) => u.user_type === 'planner')
    const pendingPlannersData = plannersData.filter((p: any) => !p.bio)
    const activePlannersData = plannersData.filter((p: any) => p.bio)

    // 2. 获取订单数据
    const { data: allOrders, error: ordersError } = await supabase
      .from('weddings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (ordersError) throw ordersError

    // 3. 组装统计数据
    const stats = {
      todayOrders: 0,
      totalOrders: allOrders?.length || 0,
      totalUsers: allUsersData.length,
      totalPlanners: plannersData.length,
      pendingPlanners: pendingPlannersData.length,
      activePlanners: activePlannersData.length
    }

    return NextResponse.json({
      success: true,
      stats,
      users: allUsersData,
      planners: plannersData,
      orders: allOrders || []
    })

  } catch (error: any) {
    console.error('获取管理后台数据失败:', error)
    return NextResponse.json(
      { error: error.message || '获取数据失败' },
      { status: 500 }
    )
  }
}
