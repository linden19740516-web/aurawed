import { supabase, UserType, UserProfile } from './supabase'

// 注册新用户
export async function signUp(
  email: string,
  password: string,
  name: string,
  city: string,
  userType: UserType,
  inviteCode?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 如果是策划师，验证邀请码
    if (userType === 'planner') {
      if (!inviteCode) {
        return { success: false, error: '策划师入驻需要邀请码' }
      }

      const { data: codeData, error: codeError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .single()

      if (codeError || !codeData) {
        return { success: false, error: '邀请码无效' }
      }

      if (codeData.used) {
        return { success: false, error: '邀请码已被使用' }
      }

      // 检查邀请码是否过期
      if (new Date(codeData.expires_at) < new Date()) {
        return { success: false, error: '邀请码已过期' }
      }
    }

    // 2. 创建 Supabase 认证用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          user_type: userType,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: '注册失败，请重试' }
    }

    // 3. 创建用户资料
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        city,
        user_type: userType,
      })

    if (profileError) {
      // 如果资料创建失败，删除已创建的用户
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: '创建用户资料失败' }
    }

    // 4. 如果是策划师，标记邀请码为已使用
    if (userType === 'planner' && inviteCode) {
      await supabase
        .from('invite_codes')
        .update({ used: true, used_by: authData.user.id })
        .eq('code', inviteCode)
    }

    // 5. 保存用户类型到本地存储（用于后续页面判断）
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurawed_user_type', userType)
    }

    return { success: true }
  } catch (error) {
    console.error('注册错误:', error)
    return { success: false, error: '注册过程出错，请重试' }
  }
}

// 用户登录
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; userType?: UserType }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { success: false, error: '邮箱或密码错误' }
    }

    if (!authData.user) {
      return { success: false, error: '登录失败' }
    }

    // 获取用户资料以确定用户类型
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: '获取用户信息失败' }
    }

    // 保存用户类型
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurawed_user_type', profile.user_type)
    }

    return { success: true, userType: profile.user_type }
  } catch (error) {
    console.error('登录错误:', error)
    return { success: false, error: '登录过程出错' }
  }
}

// 退出登录
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aurawed_user_type')
  }
}

// 获取当前用户
export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// 验证邀请码（检查是否有效）
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  error?: string
}> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) {
    return { valid: false, error: '邀请码不存在' }
  }

  if (data.used) {
    return { valid: false, error: '邀请码已被使用' }
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: '邀请码已过期' }
  }

  return { valid: true }
}

// 生成邀请码（仅管理员）
export async function generateInviteCode(): Promise<string> {
  // 实际实现时需要管理员权限
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天有效期
    })

  if (error) throw error

  return code
}
