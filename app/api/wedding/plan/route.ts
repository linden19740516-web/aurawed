import { NextRequest, NextResponse } from 'next/server'
import { llmService, TAG_TO_STYLE_MAPPING } from '@/lib/llm-service'
import { imageService, ImageResponse } from '@/lib/image-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tags, preferences, generateImages = false } = body

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: '缺少心理标签' },
        { status: 400 }
      )
    }

    // 1. 生成婚礼策划方案
    const plan = await llmService.generateWeddingPlan(tags, preferences || {})

    // 2. 如果需要，生成图像
    let images: ImageResponse[] = []
    if (generateImages) {
      const styles = tags.flatMap(tag => TAG_TO_STYLE_MAPPING[tag] || [])

      // 生成多个视角的图像
      const imageRequests = [
        {
          prompt: `${styles.join(', ')} wedding ceremony setup, grand entrance, romantic atmosphere`,
          width: 1024,
          height: 768,
        },
        {
          prompt: `${styles.join(', ')} wedding reception table, elegant dining, soft lighting`,
          width: 1024,
          height: 768,
        },
        {
          prompt: `${styles.join(', ')} wedding altar, ceremony backdrop, emotional moment`,
          width: 1024,
          height: 768,
        },
      ]

      images = await imageService.generateBatch(imageRequests)
    }

    return NextResponse.json({
      success: true,
      plan,
      images,
      tags,
    })
  } catch (error) {
    console.error('生成方案 API 错误:', error)
    return NextResponse.json(
      { error: '生成方案失败，请重试' },
      { status: 500 }
    )
  }
}
