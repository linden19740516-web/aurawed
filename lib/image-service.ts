// 图像生成服务
// 支持 Midjourney、Stable Diffusion、Seedream

import { BLACKLIST_TERMS } from './llm-service'

export type ImageProvider = 'midjourney' | 'stable-diffusion' | 'seedream'

export interface ImageRequest {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  style?: string
}

export interface ImageResponse {
  image_url: string
  thumbnail_url?: string
  provider: ImageProvider
  prompt_used: string
}

// 图像风格预设
export const IMAGE_STYLES = {
  cinematic: 'cinematic lighting, film grain, 8k resolution, highly detailed',
  wedding: 'wedding venue, elegant, romantic, soft lighting, professional photography',
  fantasy: 'fantasy, magical, ethereal, dreamlike, surreal',
  vintage: 'vintage, retro, nostalgic, warm tones, film photography',
  modern: 'modern, contemporary, minimalist, clean lines',
  dramatic: 'dramatic, high contrast, moody, cinematic',
}

export class ImageService {
  private provider: ImageProvider

  constructor(provider: ImageProvider = 'midjourney') {
    this.provider = provider
  }

  // 生成图像
  async generateImage(request: ImageRequest): Promise<ImageResponse> {
    // 先过滤提示词
    const filteredPrompt = this.filterPrompt(request.prompt)
    const negativePrompt = request.negative_prompt || this.getDefaultNegativePrompt()

    if (this.provider === 'midjourney') {
      return this.callMidjourney(filteredPrompt, negativePrompt, request.width, request.height)
    } else if (this.provider === 'seedream') {
      return this.callSeedream(filteredPrompt, request.width, request.height)
    } else {
      return this.callStableDiffusion(filteredPrompt, negativePrompt, request.width, request.height)
    }
  }

  // 过滤提示词（黑名单）
  private filterPrompt(prompt: string): string {
    let filtered = prompt

    for (const term of BLACKLIST_TERMS) {
      const regex = new RegExp(term, 'gi')
      filtered = filtered.replace(regex, '')
    }

    // 确保包含必要的元素
    if (!filtered.includes('cinematic') && !filtered.includes('film')) {
      filtered += ', cinematic lighting'
    }

    if (!filtered.includes('texture') && !filtered.includes('detailed')) {
      filtered += ', rich textures'
    }

    return filtered
  }

  // 获取默认负面提示词
  private getDefaultNegativePrompt(): string {
    return `low quality, blurry, distorted, deformed, ugly, bad anatomy, extra limbs, poorly drawn face, mutated hands, poorly drawn hands, missing fingers, NSFW, watermark, text, logo, LED strips, minimalist metal frame, linear lighting, cheap materials, plastic, synthetic`
  }

  // Midjourney API 调用
  private async callMidjourney(
    prompt: string,
    negativePrompt: string,
    width?: number,
    height?: number
  ): Promise<ImageResponse> {
    const apiKey = process.env.MIDJOURNEY_API_KEY

    if (!apiKey) {
      throw new Error('MIDJOURNEY_API_KEY is not configured')
    }

    // 注意：实际部署时需要替换为真实的 Midjourney API 端点
    // 这里使用模拟实现
    const response = await fetch('https://api.midjourney.com/v1/imagine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        width: width || 1024,
        height: height || 1024,
        style: 'photo-realistic',
      }),
    })

    if (!response.ok) {
      // 模拟返回（实际 API 不可用时）
      return {
        image_url: '/placeholder-wedding.jpg',
        provider: 'midjourney',
        prompt_used: prompt,
      }
    }

    const data = await response.json()
    return {
      image_url: data.url,
      thumbnail_url: data.thumbnail_url,
      provider: 'midjourney',
      prompt_used: prompt,
    }
  }

  // Seedream API 调用
  private async callSeedream(
    prompt: string,
    width?: number,
    height?: number
  ): Promise<ImageResponse> {
    // Seedream API 调用
    const apiKey = process.env.SEEDREAM_API_KEY

    if (!apiKey) {
      throw new Error('SEEDREAM_API_KEY is not configured')
    }

    const response = await fetch('https://api.volcengineapi.com/v1/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        width: width || 1024,
        height: height || 1024,
        num_images: 1,
      }),
    })

    if (!response.ok) {
      return {
        image_url: '/placeholder-wedding.jpg',
        provider: 'seedream',
        prompt_used: prompt,
      }
    }

    const data = await response.json()
    return {
      image_url: data.images?.[0]?.url || '/placeholder-wedding.jpg',
      provider: 'seedream',
      prompt_used: prompt,
    }
  }

  // Stable Diffusion API 调用
  private async callStableDiffusion(
    prompt: string,
    negativePrompt: string,
    width?: number,
    height?: number
  ): Promise<ImageResponse> {
    const apiUrl = process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:7860'

    const response = await fetch(`${apiUrl}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        width: width || 1024,
        height: height || 1024,
        steps: 30,
        cfg_scale: 7,
      }),
    })

    if (!response.ok) {
      return {
        image_url: '/placeholder-wedding.jpg',
        provider: 'stable-diffusion',
        prompt_used: prompt,
      }
    }

    const data = await response.json()
    const base64Image = data.images[0]

    return {
      image_url: `data:image/png;base64,${base64Image}`,
      provider: 'stable-diffusion',
      prompt_used: prompt,
    }
  }

  // 批量生成图像
  async generateBatch(
    requests: ImageRequest[]
  ): Promise<ImageResponse[]> {
    return Promise.all(requests.map(req => this.generateImage(req)))
  }
}

// 导出默认实例
export const imageService = new ImageService()
