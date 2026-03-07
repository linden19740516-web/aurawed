import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * 创建婚礼项目
 * POST /api/wedding/create
 * Body: {
 *   name: string,
 *   city: string,
 *   weddingDate?: string,
 *   budget?: number,
 *   guestCount?: number,
 *   needPlanner: boolean,
 *   plannerServiceType?: 'remote' | 'full',
 *   tags: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      city,
      weddingDate,
      budget,
      guestCount,
      needPlanner,
      plannerServiceType,
      tags
    } = body

    if (!name || !city) {
      return NextResponse.json(
        { error: '缺少必要信息' },
        { status: 400 }
      )
    }

    // 创建婚礼项目
    const { data: wedding, error: weddingError } = await (supabase
      .from('weddings') as any)
      .insert({
        couple_id: user.id,
        name,
        city,
        wedding_date: weddingDate,
        budget,
        guest_count: guestCount || 0,
        need_planner: needPlanner || false,
        planner_service_type: plannerServiceType || null,
        planner_status: needPlanner ? 'pending' : null,
        status: 'story'
      })
      .select()
      .single()

    if (weddingError) {
      console.error('创建婚礼项目失败:', weddingError)
      return NextResponse.json(
        { error: '创建婚礼项目失败' },
        { status: 500 }
      )
    }

    // 如果需要策划师，匹配同城市策划师
    if (needPlanner && plannerServiceType) {
      // 调用匹配API
      try {
        const matchResponse = await fetch(new URL('/api/planner/match', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city, serviceType: plannerServiceType })
        })

        const matchResult = await matchResponse.json()

        if (matchResult.success && matchResult.planners?.length > 0) {
          // 更新婚礼状态为已匹配
          await (supabase
            .from('weddings') as any)
            .update({
              planner_status: 'matched'
            })
            .eq('id', wedding.id)
        }
      } catch (matchError) {
        console.error('匹配策划师失败:', matchError)
        // 继续创建婚礼项目，匹配失败不影响主流程
      }
    }

    return NextResponse.json({
      success: true,
      wedding,
      message: needPlanner ? '婚礼项目已创建，正在为您匹配策划师' : '婚礼项目已创建'
    })

  } catch (error) {
    console.error('创建婚礼 API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
