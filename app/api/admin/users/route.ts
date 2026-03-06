import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 删除用户资料
 * DELETE /api/admin/users
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    // 注意：在Supabase中，如果是要彻底删除用户，其实需要删除 auth.users 里的记录（这需要 service_role 权限）。
    // 这里我们先只删除 user_profiles 表的资料，由于设置了 ON DELETE CASCADE，或者如果是反向的话，
    // 我们可能需要调用专门的 Admin API。
    // 为了简单实现"软删除"或"禁用"的效果，我们给它打一个删除标记或者先尝试物理删除 user_profiles。

    // 这里执行物理删除 profile：
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: '用户已删除' })
  } catch (error: any) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    )
  }
}
