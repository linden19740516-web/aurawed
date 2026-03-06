import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 数据库连通性测试
 * GET /api/test-connection
 */
export async function GET() {
  const results: any = {
    success: true,
    timestamp: new Date().toISOString(),
    tables: {}
  }

  // 测试表列表
  const tables = [
    'user_profiles',
    'weddings',
    'wedding_stories',
    'wedding_plans',
    'aesthetic_tags',
    'chat_messages',
    'scheduled_tasks',
    'media_files',
    'planner_service_areas',
    'invite_codes'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        results.tables[table] = { status: 'error', message: error.message }
        results.success = false
      } else {
        results.tables[table] = { status: 'ok', count: data?.length ?? 0 }
      }
    } catch (err: any) {
      results.tables[table] = { status: 'error', message: err.message }
      results.success = false
    }
  }

  const statusCode = results.success ? 200 : 500
  return NextResponse.json(results, { status: statusCode })
}
