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

    // 使用 Imagen 模型生成图片
    const model = genAI.getGenerativeModel({ model: 'imagen-3-generate-002' })

    const result = await model.generateImages({
      prompt: options.prompt,
      numberOfImages: 1,
      // @ts-ignore - Imagen API 有额外的配置选项
      aspectRatio: options.width && options.height
        ? `${options.width}:${options.height}`
        : '16:9'
    })

    if (!result.generatedImages || result.generatedImages.length === 0) {
      throw new Error('未生成图片')
    }

    const image = result.generatedImages[0]

    // Imagen 返回的是 base64 或 image bytes
    // 需要转换为可访问的 URL
    let imageUrl = ''

    if (image.image?.imageBytes) {
      // 转换为 base64 URL
      const base64 = Buffer.from(image.image.imageBytes).toString('base64')
      imageUrl = `data:image/png;base64,${base64}`
    } else if (image.image?.base64MimeType) {
      imageUrl = `data:${image.image.base64MimeType};base64,${image.image.base64}`
    }

    if (!imageUrl) {
      throw new Error('无法获取生成的图片')
    }

    return {
      success: true,
      imageUrl,
      seed: undefined // Gemini/Imagen 不直接提供 seed
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
 * 注意：需要通过第三方API服务（如 way to jp@github）
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
    // 这里使用第三方 Midjourney API
    // 实际使用时替换为你的API地址
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

    // Stable Diffusion 返回 base64 编码的图片
    const base64Image = data.images?.[0]

    if (!base64Image) {
      throw new Error('未返回图片数据')
    }

    // 转换为可访问的 URL（这里简单处理，实际项目可上传到存储）
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
  // 优先使用 Google Gemini/Imagen（你选择的）
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
