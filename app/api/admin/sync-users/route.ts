import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 管理员客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 同步用户数据 - 将 auth.users 中没有 profile 的用户创建 profile
export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    // 1. 获取所有 auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('获取auth用户失败:', authError)
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }

    // 2. 获取所有 user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')

    if (profilesError) {
      console.error('获取profiles失败:', profilesError)
      return NextResponse.json({ success: false, error: profilesError.message }, { status: 500 })
    }

    const profileIds = new Set(profiles?.map(p => p.id) || [])
    const authUserIds = new Set(authUsers.users.map(u => u.id))

    // 3. 找出需要同步的用户（在auth中存在但profile中不存在的）
    const usersToSync = authUsers.users.filter(u => !profileIds.has(u.id))

    if (usersToSync.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有用户已同步',
        synced: 0
      })
    }

    // 4. 为每个缺失的用户创建 profile
    const syncResults = []
    for (const user of usersToSync) {
      const email = user.email || ''
      const name = user.user_metadata?.name || email.split('@')[0] || '未命名用户'
      const userType = user.user_metadata?.user_type || 'couple'

      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email,
          name,
          user_type: userType,
          city: '未知'
        })

      if (insertError) {
        console.error(`创建用户profile失败 (${user.id}):`, insertError)
        syncResults.push({ id: user.id, success: false, error: insertError.message })
      } else {
        syncResults.push({ id: user.id, success: true })
      }
    }

    const successfulSync = syncResults.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `同步完成，成功同步 ${successfulSync} 个用户`,
      synced: successfulSync,
      results: syncResults
    })

  } catch (error: any) {
    console.error('同步用户失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 获取用户列表（包含同步状态）
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    const { searchParams } = new URL(request.url)
    const syncStatus = searchParams.get('sync_status')

    // 获取 auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }

    // 获取 user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')

    if (profilesError) {
      return NextResponse.json({ success: false, error: profilesError.message }, { status: 500 })
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // 合并数据
    const mergedUsers = authUsers.users.map(user => {
      const profile = profileMap.get(user.id)
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || profile?.name || '未命名',
        user_type: user.user_metadata?.user_type || profile?.user_type || 'couple',
        created_at: user.created_at,
        profile_exists: !!profile,
        profile_data: profile
      }
    })

    // 如果指定了同步状态过滤
    let filteredUsers = mergedUsers
    if (syncStatus === 'missing') {
      filteredUsers = mergedUsers.filter(u => !u.profile_exists)
    } else if (syncStatus === 'synced') {
      filteredUsers = mergedUsers.filter(u => u.profile_exists)
    }

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      stats: {
        total_auth: authUsers.users.length,
        total_profiles: profiles?.length || 0,
        missing_profiles: mergedUsers.filter(u => !u.profile_exists).length
      }
    })

  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
