import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 根据城市匹配策划师
 * POST /api/planner/match
 * Body: { city: string, serviceType: 'remote' | 'full' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, serviceType } = body

    if (!city) {
      return NextResponse.json(
        { error: '请提供城市信息' },
        { status: 400 }
      )
    }

    // 查询同城市的策划师
    // 支持远程服务的策划师不受城市限制
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        city,
        company_name,
        bio,
        service_type,
        service_price,
        avatar_url
      `)
      .eq('user_type', 'planner')
      .eq('service_type', serviceType || 'full')
      .eq('city', city)
      .limit(10)

    const { data: planners, error } = await query

    if (error) {
      console.error('查询策划师失败:', error)
      return NextResponse.json(
        { error: '查询策划师失败' },
        { status: 500 }
      )
    }

    // 如果没有找到同城市的服务型策划师，尝试找支持远程的
    if (!planners || planners.length === 0) {
      const { data: remotePlanners } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          city,
          company_name,
          bio,
          service_type,
          service_price,
          avatar_url
        `)
        .eq('user_type', 'planner')
        .eq('service_type', 'remote')
        .limit(10)

      return NextResponse.json({
        success: true,
        planners: remotePlanners || [],
        message: remotePlanners?.length ? '为您找到支持远程服务的策划师' : '暂无可用策划师'
      })
    }

    return NextResponse.json({
      success: true,
      planners,
      message: `为您找到 ${planners.length} 位 ${city} 的专业策划师`
    })

  } catch (error) {
    console.error('匹配策划师 API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
