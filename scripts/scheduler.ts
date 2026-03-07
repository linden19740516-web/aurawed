/**
 * 婚礼AI平台 - 自动化任务调度脚本
 * 功能：自动处理 weddings 表中 status 为 'story' | 'planning' | 'design' 的任务
 * 执行流程：
 *   - status='story': 生成策划方案 -> 更新为 'planning'
 *   - status='planning': 生成设计图 -> 更新为 'design'
 *   - status='design': 标记完成 -> 更新为 'completed'
 */

import { createClient } from '@supabase/supabase-js'

// ==================== 配置 ====================
const SUPABASE_URL = 'https://cgdyfikhbfssntetnqne.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZHlmaWtoYmZzc250ZXRucW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczMjE5MCwiZXhwIjoyMDg4MzA4MTkwfQ.ra14j2Ob-Rpzjc1ng88mADv4P6JdHQTJf-W9e2Tnvu0'

// 创建 Supabase Admin 客户端（使用 Service Role Key）
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ==================== 辅助函数 ====================

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 调用策划方案生成 API
 */
async function generatePlan(weddingId: string, tags: string[], preferences: any): Promise<any> {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

  const response = await fetch(`${API_BASE_URL}/api/wedding/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tags,
      preferences,
      generateImages: false // 先生成方案，不生成图片
    })
  })

  if (!response.ok) {
    throw new Error(`Plan API 返回错误: ${response.status}`)
  }

  return await response.json()
}

/**
 * 调用图片生成 API
 */
async function generateImages(weddingId: string, tags: string[], plan: string): Promise<any> {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

  // 使用 /api/wedding/plan 接口并设置 generateImages: true
  const response = await fetch(`${API_BASE_URL}/api/wedding/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tags,
      preferences: { plan },
      generateImages: true
    })
  })

  if (!response.ok) {
    throw new Error(`Image API 返回错误: ${response.status}`)
  }

  return await response.json()
}

// ==================== 主函数 ====================

async function processWeddingTask(wedding: any) {
  const { id, status, story, tags, preferences } = wedding
  console.log(`\n📋 处理任务 [${id}] - 当前状态: ${status}`)

  try {
    switch (status) {
      case 'story': {
        // 解析 tags（如果存储为 JSON 字符串）
        let parsedTags = tags
        if (typeof tags === 'string') {
          parsedTags = JSON.parse(tags)
        }

        // 解析 preferences（如果存储为 JSON 字符串）
        let parsedPreferences = preferences
        if (typeof preferences === 'string') {
          parsedPreferences = JSON.parse(preferences)
        }

        console.log(`  � Generating plan for wedding ${id}...`)
        const result = await generatePlan(id, parsedTags, parsedPreferences || {})

        if (result.success && result.plan) {
          // 更新数据库
          await supabaseAdmin
            .from('weddings')
            .update({
              plan: result.plan,
              status: 'planning',
              updated_at: new Date().toISOString()
            })
            .eq('id', id)

          console.log(`  ✅ 已生成策划方案，状态更新为: planning`)
          return { success: true, action: 'plan_generated', weddingId: id }
        } else {
          throw new Error('生成策划方案失败')
        }
      }

      case 'planning': {
        // 解析 tags
        let parsedTags = tags
        if (typeof tags === 'string') {
          parsedTags = JSON.parse(tags)
        }

        console.log(`  🖼️ Generating images for wedding ${id}...`)
        const result = await generateImages(id, parsedTags, wedding.plan)

        if (result.success && result.images && result.images.length > 0) {
          // 取第一张图片作为设计图
          const designUrl = result.images[0].url || result.images[0].imageUri

          // 更新数据库
          await supabaseAdmin
            .from('weddings')
            .update({
              design_url: designUrl,
              status: 'design',
              updated_at: new Date().toISOString()
            })
            .eq('id', id)

          console.log(`  ✅ 已生成设计图，状态更新为: design`)
          return { success: true, action: 'images_generated', weddingId: id, designUrl }
        } else {
          throw new Error('生成设计图失败')
        }
      }

      case 'design': {
        console.log(`  🎉 Marking wedding ${id} as completed...`)

        // 标记为完成
        await supabaseAdmin
          .from('weddings')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        console.log(`  ✅ 任务已完成，状态更新为: completed`)
        return { success: true, action: 'completed', weddingId: id }
      }

      default:
        console.warn(`  ⚠️ 未知状态: ${status}`)
        return { success: false, action: 'unknown_status', weddingId: id }
    }
  } catch (error: any) {
    console.error(`  ❌ 处理失败:`, error.message)
    return { success: false, action: 'error', weddingId: id, error: error.message }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('🎬 婚礼AI平台 - 自动化任务调度开始')
  console.log('='.repeat(60))

  try {
    // 1. 查询待处理任务（最多3个）
    console.log('\n🔍 正在查询待处理任务...')

    const { data: weddings, error } = await supabaseAdmin
      .from('weddings')
      .select('*')
      .in('status', ['story', 'planning', 'design'])
      .order('created_at', { ascending: true })
      .limit(3)

    if (error) {
      console.error('❌ 查询数据库失败:', error.message)
      process.exit(1)
    }

    if (!weddings || weddings.length === 0) {
      console.log('\n✅ 没有待处理的任务')
      console.log('='.repeat(60))
      return
    }

    console.log(`📊 找到 ${weddings.length} 个待处理任务`)

    // 2. 逐个处理任务
    const results = []
    for (const wedding of weddings) {
      const result = await processWeddingTask(wedding)
      results.push(result)

      // 每个任务之间稍作延迟，避免 API 过载
      await sleep(1000)
    }

    // 3. 输出执行结果摘要
    console.log('\n' + '='.repeat(60))
    console.log('📈 执行结果摘要')
    console.log('='.repeat(60))

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`总计: ${results.length} | 成功: ${successCount} | 失败: ${failCount}`)

    results.forEach((r, i) => {
      const status = r.success ? '✅' : '❌'
      console.log(`  ${i + 1}. ${status} ${r.weddingId} - ${r.action}`)
    })

    console.log('='.repeat(60))
    console.log('🎉 任务调度完成')
    console.log('='.repeat(60))

  } catch (error: any) {
    console.error('\n❌ 调度脚本执行失败:', error.message)
    process.exit(1)
  }
}

// 执行主函数
main()
