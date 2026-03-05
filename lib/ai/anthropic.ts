import Anthropic from '@anthropic-ai/sdk'

// 初始化 Anthropic 客户端
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

/**
 * 使用 Claude 生成婚礼方案
 */
export async function generateWeddingPlanWithClaude(story: {
  loveStory: string
  meaningfulMoments: string
  sharedInterests: string
  valuesAndBeliefs: string
  dreamWedding: string
  mustHaveElements: string
  mustAvoid: string
}, selectedTags: string[]): Promise<{
  conceptName: string
  conceptDescription: string
  colorPalette: string[]
  styleDirection: string
  layoutDescription: string
  floralDescription: string
  lightingDescription: string
  timelineSuggestion: string
  budgetBreakdown: Record<string, number>
  aiPrompt: string
}> {
  const systemPrompt = `你是一位世界顶级婚礼策划大师，擅长将新人的爱情故事转化为独特而富有叙事感的婚礼设计方案。

你的设计原则：
1. 拒绝同质化，每场婚礼都应该是独一无二的
2. 将新人的爱情故事元素融入婚礼的每个细节
3. 注重情感表达，而不仅仅是视觉堆砌
4. 考虑来宾体验，营造沉浸式氛围
5. 预算分配合理，注重性价比

请基于新人提供的故事信息，生成一个完整的婚礼方案。`

  const userPrompt = `## 新人故事信息

### 爱情故事
${story.loveStory}

### 难忘时刻
${story.meaningfulMoments}

### 共同爱好
${story.sharedInterests}

### 价值观
${story.valuesAndBeliefs}

### 梦想中的婚礼
${story.dreamWedding}

### 必备元素
${story.mustHaveElements}

### 想要避免的
${story.mustAvoid}

### 已选美学标签
${selectedTags.join('、')}

---

请生成一个婚礼方案，包含以下内容：
1. 概念名称（独特、有诗意）
2. 概念描述（设计理念，300字左右）
3. 配色方案（列出主色、辅色、点缀色）
4. 风格方向
5. 布局描述（各区域设计思路）
6. 花艺描述
7. 灯光设计
8. 流程时间线建议
9. 预算分配（按百分比）
10. 用于生成效果图的AI提示词（英文，详细描述场景）

请以JSON格式返回，包含以下字段：
conceptName, conceptDescription, colorPalette (数组), styleDirection, layoutDescription, floralDescription, lightingDescription, timelineSuggestion, budgetBreakdown (对象), aiPrompt`

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('AI 生成失败，请重试')
  }

  return JSON.parse(content.text)
}

/**
 * 使用 Claude 生成婚礼灵感
 */
export async function generateWeddingInspirationWithClaude(): Promise<{
  conceptName: string
  description: string
  mainElements: string[]
  mood: string
  colorPalette: string[]
}> {
  const systemPrompt = `你是一位充满奇思妙想的婚礼灵感大师。你精通各行各业关于美学的事物，上知天文下至地理，甚至了解全世界的历史。你拥有一套完整的高审美防火墙，绝不使用廉价或烂大街的东西。

每天生成一个独特的婚礼灵感，要浪漫、有创意、不重复。`

  const userPrompt = `请生成一个婚礼灵感，包含：
1. 概念名称（要独特、有诗意）
2. 灵感阐述（200字左右，讲述设计理念）
3. 主体结构元素（7个）
4. 装饰细节元素（2个）
5. 仪式流程建议（1个）

请以JSON格式返回：
{
  "conceptName": "名称",
  "description": "灵感阐述",
  "mainElements": ["元素1", "元素2", ...],
  "decorDetails": ["细节1", "细节2"],
  "ritualFlow": "流程建议"
}`

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('AI 生成失败，请重试')
  }

  return JSON.parse(content.text)
}

export default anthropic
