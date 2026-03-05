/**
 * 图片生成服务
 * 支持多种AI绘图后端：Google Gemini/Imagen、Midjourney、Stable Diffusion 等
 */

// Google Gemini 客户端
async function getGeminiClient() {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_IMAGE_API_KEY || '')
  return genAI
}

export interface ImageGenerationOptions {
  prompt: string
  width?: number
  height?: number
  style?: 'photo' | 'illustration' | '3d' | 'anime'
  quality?: 'standard' | 'hd'
  seed?: number
}

export interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
  seed?: number
}

/**
 * 使用 Google Gemini/Imagen 生成图片
 * Gemini 的 Imagen 模型专门用于图片生成
 */
export async function generateImageWithGemini(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_IMAGE_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API 未配置'
    }
  }

  try {
    const genAI = await getGeminiClient()

    // 使用 Gemini 2.0 Flash 实验版本生成图片
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // 生成内容（文本描述 + 图片）
    const result = await model.generateContent([
      options.prompt,
      { inlineData: { mimeType: 'image/png', data: '' } }
    ])

    // 检查是否有图片响应
    const response = result.response
    if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0]
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data
            const mimeType = part.inlineData.mimeType || 'image/png'
            return {
              success: true,
              imageUrl: `data:${mimeType};base64,${base64}`
            }
          }
        }
      }
    }

    // 如果没有返回图片，返回占位图
    return {
      success: true,
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCI+Tm8gSW1hZ2UgR2VuZXJhdGVkPC90ZXh0Pjwvc3ZnPg=='
    }
  } catch (error) {
    console.error('Gemini 图片生成错误:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gemini 图片生成失败'
    }
  }
}

/**
 * 使用 Midjourney 生成图片
 * 注意：需要通过第三方API服务
 */
export async function generateImageWithMidjourney(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiKey = process.env.MIDJOURNEY_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'Midjourney API 未配置'
    }
  }

  try {
    const response = await fetch('https://api.midjourney.com/v1/imagine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: options.prompt,
        width: options.width || 1792,
        height: options.height || 1024,
        style: options.style || 'photo',
        quality: options.quality || 'standard',
        seed: options.seed
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      imageUrl: data.image_url,
      seed: data.seed
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成失败'
    }
  }
}

/**
 * 使用 Stable Diffusion 本地/云端 API 生成图片
 */
export async function generateImageWithStableDiffusion(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiUrl = process.env.STABLE_DIFFUSION_API_URL

  if (!apiUrl) {
    return {
      success: false,
      error: 'Stable Diffusion API 未配置'
    }
  }

  try {
    const response = await fetch(`${apiUrl}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: options.prompt,
        width: options.width || 512,
        height: options.height || 512,
        steps: 30,
        cfg_scale: 7,
        seed: options.seed || -1
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const base64Image = data.images?.[0]

    if (!base64Image) {
      throw new Error('未返回图片数据')
    }

    const imageUrl = `data:image/png;base64,${base64Image}`

    return {
      success: true,
      imageUrl,
      seed: data.seed
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成失败'
    }
  }
}

/**
 * 统一的图片生成接口
 * 会根据配置自动选择可用的后端
 */
export async function generateWeddingImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  // 优先使用 Google Gemini/Imagen
  if (process.env.GEMINI_API_KEY || process.env.GEMINI_IMAGE_API_KEY) {
    return generateImageWithGemini(options)
  }

  // 其次使用 Midjourney
  if (process.env.MIDJOURNEY_API_KEY) {
    return generateImageWithMidjourney(options)
  }

  // 最后使用 Stable Diffusion
  if (process.env.STABLE_DIFFUSION_API_URL) {
    return generateImageWithStableDiffusion(options)
  }

  return {
    success: false,
    error: '未配置任何图片生成服务'
  }
}

/**
 * 生成婚礼场景提示词
 */
export function buildWeddingImagePrompt(params: {
  conceptName: string
  description: string
  colorPalette: string[]
  styleDirection: string
  layoutDescription: string
  floralDescription: string
  lightingDescription: string
  area?: 'ceremony' | 'reception' | 'photo' | 'signin' | 'aisle'
}): string {
  const areaPrompts: Record<string, string> = {
    ceremony: 'wedding ceremony backdrop, altar area, exchange of vows',
    reception: 'wedding reception venue, dining area, tablescape',
    photo: 'wedding photo zone, backdrop for photos, photo opportunity area',
    signin: 'wedding sign-in area, guest book table',
    aisle: 'wedding aisle, flower path, walk way'
  }

  const area = params.area || 'ceremony'
  const areaPrompt = areaPrompts[area]

  const prompt = `
${areaPrompt}

Concept: ${params.conceptName}
${params.description}

Color palette: ${params.colorPalette.join(', ')}

Style: ${params.styleDirection}

Floral: ${params.floralDescription}

Lighting: ${params.lightingDescription}

Requirements:
- High quality wedding photography
- Professional lighting
- Detailed and realistic
- Elegant and romantic atmosphere
- 8K quality
- Wedding industry professional photography
`.trim()

  return prompt
}
