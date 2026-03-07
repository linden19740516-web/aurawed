import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用 Service Role Key 创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * 执行 SQL 管理命令
 * POST /api/admin/exec-sql
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sql } = body

    if (!sql) {
      return NextResponse.json(
        { error: 'SQL 语句不能为空' },
        { status: 400 }
      )
    }

    // 安全检查：只允许特定操作
    const allowedOperations = [
      'DROP POLICY',
      'CREATE POLICY',
      'ALTER FUNCTION',
      'ALTER AUTH'
    ]

    const isAllowed = allowedOperations.some(op => sql.toUpperCase().includes(op))
    if (!isAllowed) {
      return NextResponse.json(
        { error: '不允许执行此操作' },
        { status: 403 }
      )
    }

    // 使用 postgres 执行 SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      statement: sql
    })

    if (error) {
      console.error('SQL 执行失败:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('执行 SQL 失败:', error)
    return NextResponse.json(
      { error: error.message || '执行失败' },
      { status: 500 }
    )
  }
}
