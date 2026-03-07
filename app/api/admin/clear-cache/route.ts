import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

/**
 * 清除缓存
 * POST /api/admin/clear-cache
 */
export async function POST() {
  try {
    // 这里可以添加更多缓存清除逻辑
    // 例如：
    // - 清除数据库缓存
    // - 清除 Redis 缓存（如果有）
    // - 清除其他临时数据

    // 模拟清除缓存操作
    // 实际项目中可以根据需要实现具体的缓存清除逻辑

    return NextResponse.json({
      success: true,
      message: '缓存已清除'
    })
  } catch (error: any) {
    console.error('清除缓存失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '清除失败' },
      { status: 500 }
    )
  }
}
