import { NextRequest, NextResponse } from 'next/server'
import { signUp, validateInviteCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, city, userType, inviteCode } = body

    // 验证必填字段
    if (!email || !password || !name || !city || !userType) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 验证用户类型
    if (!['couple', 'planner'].includes(userType)) {
      return NextResponse.json(
        { error: '无效的用户类型' },
        { status: 400 }
      )
    }

    // 如果是策划师，验证邀请码
    if (userType === 'planner') {
      const validation = await validateInviteCode(inviteCode)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }
    }

    // 执行注册
    const result = await signUp(email, password, name, city, userType, inviteCode)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
    })
  } catch (error) {
    console.error('注册 API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
