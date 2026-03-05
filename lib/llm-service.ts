// LLM 服务层
// 支持 OpenAI GPT-4 和 Anthropic Claude

export type LLMProvider = 'openai' | 'anthropic'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 心理标签到美学风格的映射
export const TAG_TO_STYLE_MAPPING: Record<string, string[]> = {
  '古典主义': ['古典美学', '复古质感', '油画色调', '丝绸绒布', '黄铜装饰'],
  '蒸汽朋克': ['机械美学', '黄铜质感', '工业浪漫', '齿轮元素', '铜管灯具'],
  '自然主义': ['有机形态', '植物美学', '清新色调', '藤蔓绿植', '自然光线'],
  '极简主义': ['现代简约', '几何美学', '纯净空间', '线条感', '留白'],
  '浪漫主义': ['柔美氛围', '梦幻色调', '情感表达', '花瓣装饰', '柔光'],
  '暗黑美学': ['戏剧张力', '神秘氛围', '对比强烈', '暗色调', '烛光'],
  '怀旧情结': ['复古情怀', '时光质感', '温暖色调', '复古物件', '做旧纹理'],
  '未来感': ['科技美学', '前卫设计', '冷调光影', '金属质感', 'LED氛围'],
  '东方美学': ['含蓄典雅', '传统元素', '意境营造', '水墨', '屏风'],
  '童话感': ['梦幻场景', '纯真氛围', '浪漫叙事', '纱幔', '星星灯'],
}

// 黑名单过滤 - 禁止使用的元素
export const BLACKLIST_TERMS = [
  'LED strips',
  'LED灯带',
  'minimalist metal frame',
  '极简金属框架',
  'linear lighting',
  '线性灯光',
  '灯带',
  '金属框架',
]

// 策划师 Prompt
export const PLANNER_SYSTEM_PROMPT = `你是一位顶级婚礼策划师，擅长将新人的心理偏好转化为富有叙事感的婚礼方案。

## 你的任务
根据用户的选择和心理标签，生成3个具有诗意的婚礼主题名，编写一段"通感描述"（包含嗅觉、光影、材质感受），设计3个"高光仪式环节"。

## 约束
1. 禁止使用任何廉价工业化元素（如灯带、极简金属框架、线性灯光）
2. 必须使用自然光影、蜡烛、复古台灯等有温度的照明
3. 强调情感表达和叙事感，避免流水线式设计
4. 输出必须包含中文

## 输出格式
主题名：
1. xxx
2. xxx
3. xxx

通感描述：
（包含嗅觉、光影、材质的细腻描写）

高光仪式环节：
1. xxx - 描述
2. xxx - 描述
3. xxx - 描述`

// 设计师 Prompt
export const DESIGNER_SYSTEM_PROMPT = `你是一位顶级婚礼场景设计师，擅长将美学概念转化为视觉图像提示词。

## 你的任务
根据给定的美学标签，生成适合 Midjourney/Stable Diffusion 的图像提示词。

## 必须遵守的约束
1. 【强制】禁止包含以下词汇：
   - LED strips / LED灯带 / 灯带
   - minimalist metal frame / 极简金属框架 / 金属框架
   - linear lighting / 线性灯光

2. 【强制】必须包含以下元素：
   - 材质肌理：fabric textures, wood grain, floral textures, candlelight
   - 自然光影：natural light, warm lighting, candlelight, shadows
   - 高级质感：cinematic lighting, rich textures, organic, 8k resolution

## 输出格式
返回一段完整的英文提示词，用于 AI 图像生成。

## 负面提示词（必须包含）
NSFW, low quality, blurry, LED strips, minimalist metal frame, linear lighting, cheap materials`

export class LLMService {
  private provider: LLMProvider

  constructor(provider: LLMProvider = 'anthropic') {
    this.provider = provider
  }

  // 生成婚礼策划方案
  async generateWeddingPlan(
    tags: string[],
    userPreferences: Record<string, any>
  ): Promise<{
    themes: string[]
    sensoryDescription: string
    ceremonyHighlights: string[]
  }> {
    const styleDescriptions = tags.flatMap(tag => TAG_TO_STYLE_MAPPING[tag] || [])

    const prompt = `用户心理标签：${tags.join(' / ')}
推荐美学风格：${styleDescriptions.join(' / ')}

用户基础信息：${JSON.stringify(userPreferences)}

请根据以上信息生成婚礼策划方案。`

    const response = await this.chat([
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])

    return this.parsePlannerResponse(response.content)
  }

  // 生成图像提示词
  async generateImagePrompt(
    styles: string[],
    mood: string
  ): Promise<string> {
    const prompt = `美学风格：${styles.join(' / ')}
情感氛围：${mood}

请生成适合 AI 图像生成的英文提示词。`

    const response = await this.chat([
      { role: 'system', content: DESIGNER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])

    // 应用黑名单过滤
    return this.applyBlacklistFilter(response.content)
  }

  // 聊天接口
  private async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (this.provider === 'anthropic') {
      return this.callAnthropic(messages)
    } else {
      return this.callOpenAI(messages)
    }
  }

  // Anthropic Claude 调用
  private async callAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const filteredMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: filteredMessages,
        system: systemMessage,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    }
  }

  // OpenAI 调用
  private async callOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    }
  }

  // 解析策划师响应
  private parsePlannerResponse(content: string): {
    themes: string[]
    sensoryDescription: string
    ceremonyHighlights: string[]
  } {
    const lines = content.split('\n')
    let currentSection = ''
    const result = {
      themes: [] as string[],
      sensoryDescription: '',
      ceremonyHighlights: [] as string[],
    }

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.startsWith('主题名：') || trimmed.startsWith('主题:')) {
        currentSection = 'themes'
        continue
      } else if (trimmed.startsWith('通感描述：') || trimmed.startsWith('通感描述:')) {
        currentSection = 'sensory'
        continue
      } else if (trimmed.startsWith('高光仪式环节：') || trimmed.startsWith('高光仪式环节:')) {
        currentSection = 'highlights'
        continue
      }

      if (currentSection === 'themes' && trimmed.match(/^\d+[.、]/)) {
        result.themes.push(trimmed.replace(/^\d+[.、]\s*/, ''))
      } else if (currentSection === 'sensory' && trimmed) {
        result.sensoryDescription += trimmed + ' '
      } else if (currentSection === 'highlights' && trimmed.match(/^\d+[.、]/)) {
        result.ceremonyHighlights.push(trimmed.replace(/^\d+[.、]\s*/, ''))
      }
    }

    return result
  }

  // 应用黑名单过滤
  private applyBlacklistFilter(prompt: string): string {
    let filtered = prompt

    for (const term of BLACKLIST_TERMS) {
      const regex = new RegExp(term, 'gi')
      filtered = filtered.replace(regex, '[FILTERED]')
    }

    return filtered
  }
}

// 导出默认实例
export const llmService = new LLMService()
