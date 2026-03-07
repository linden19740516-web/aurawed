import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * 删除用户资料
 * DELETE /api/admin/users
 * 同时删除 user_profiles 表和 auth.users 表中的记录
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 })
    }

    // 1. 先删除 user_profiles 表中的记录
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('删除 user_profiles 失败:', profileError)
      // 继续尝试删除 auth.users
    }

    // 2. 删除 auth.users 表中的记录
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error('删除 auth.users 失败:', authError)
      // 如果 profile 已删除但 auth 失败，返回部分成功
      if (!profileError) {
        return NextResponse.json({
          success: true,
          message: '用户资料已删除，但认证账户删除失败'
        })
      }
      throw authError
    }

    return NextResponse.json({ success: true, message: '用户已完全删除' })
  } catch (error: any) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    )
  }
}
