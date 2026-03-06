import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用 Service Role Key 创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 管理员创建用户 (跳过邮箱确认)
 * POST /api/admin/create-user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, city, userType, inviteCode } = body

    // 验证必填字段
    if (!email || !password || !name || !city || !userType) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证邀请码 (策划师必须)
    if (userType === 'planner') {
      if (!inviteCode) {
        return NextResponse.json(
          { error: '策划师入驻需要邀请码' },
          { status: 400 }
        )
      }

      // 验证邀请码
      const { data: inviteData, error: inviteError } = await supabaseAdmin
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .single()

      if (inviteError || !inviteData) {
        return NextResponse.json(
          { error: '邀请码无效' },
          { status: 400 }
        )
      }

      if (inviteData.used) {
        return NextResponse.json(
          { error: '邀请码已被使用' },
          { status: 400 }
        )
      }

      // 检查邀请码是否过期
      if (new Date(inviteData.expires_at) < new Date()) {
        return NextResponse.json(
          { error: '邀请码已过期' },
          { status: 400 }
        )
      }
    }

    // 使用 Admin API 创建用户 (跳过邮箱确认)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 跳过邮箱确认
      user_metadata: { name }
    })

    if (authError) {
      // 如果用户已存在，尝试获取用户
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        )
      }
      throw authError
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '创建用户失败' },
        { status: 500 }
      )
    }

    // 创建用户资料
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        user_type: userType,
        city,
      })

    if (profileError) {
      console.error('创建资料失败:', profileError)
      // 用户已创建，资料可能重复，尝试更新
      await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email,
          name,
          user_type: userType,
          city,
        })
    }

    // 如果是策划师，标记邀请码为已使用
    if (userType === 'planner' && inviteCode) {
      await supabaseAdmin
        .from('invite_codes')
        .update({ used: true, used_by: authData.user.id })
        .eq('code', inviteCode)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    })

  } catch (error: any) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { error: error.message || '创建用户失败' },
      { status: 500 }
    )
  }
}
