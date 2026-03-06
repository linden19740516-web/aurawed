import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 删除订单项目
 * DELETE /api/admin/orders
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('weddings')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: '订单已删除' })
  } catch (error: any) {
    console.error('删除订单失败:', error)
    return NextResponse.json(
      { error: error.message || '删除失败' },
      { status: 500 }
    )
  }
}
