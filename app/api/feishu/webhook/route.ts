import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 飞书 Webhook 配置
const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL
const FEISHU_VERIFICATION_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN
const FEISHU_ENCRYPT_KEY = process.env.FEISHU_ENCRYPT_KEY

// 飞书签名验证
function verifyFeishuSignature(timestamp: string, sign: string): boolean {
  if (!FEISHU_ENCRYPT_KEY) return true // 如果没有配置密钥则跳过验证

  const stringToSign = `${timestamp}{FEISHU_ENCRYPT_KEY}`
  const hmac = crypto.createHmac('sha256', FEISHU_ENCRYPT_KEY)
  const digest = hmac.update(stringToSign).digest('base64')
  return digest === sign
}

// 解析飞书消息
function parseFeishuMessage(body: any): { type: string, content: string, userId?: string } {
  // 处理卡片消息
  if (body.type === 'interactive') {
    return {
      type: 'card',
      content: JSON.stringify(body),
      userId: body.sender?.sender_id?.user_id
    }
  }

  // 处理文本消息
  const message = body.message
  if (message && message.message_type === 'text') {
    const content = JSON.parse(message.content).text
    return {
      type: 'text',
      content: content,
      userId: message.sender?.sender_id?.user_id
    }
  }

  return { type: 'unknown', content: '' }
}

// 发送消息回飞书
async function sendMessageToFeishu(message: string, msgType: 'text' | 'interactive' = 'text') {
  if (!FEISHU_WEBHOOK_URL) {
    console.error('FEISHU_WEBHOOK_URL not configured')
    return false
  }

  try {
    const response = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: msgType,
        content: {
          text: message
        }
      })
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send message to Feishu:', error)
    return false
  }
}

// 发送卡片消息回飞书
async function sendCardToFeishu(card: any) {
  if (!FEISHU_WEBHOOK_URL) return false

  try {
    const response = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'interactive',
        content: card
      })
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send card to Feishu:', error)
    return false
  }
}

// POST - 接收飞书消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Feishu webhook received:', body)

    // 验证消息类型
    const { type, content, userId } = parseFeishuMessage(body)

    // 飞书开放平台回调验证
    if (body.type === 'url_verification') {
      return NextResponse.json({
        challenge: body.challenge
      })
    }

    // 事件回调验证
    if (body.type === 'event_callback') {
      // 处理各种事件类型
      const event = body.event
      switch (event?.type) {
        case 'message':
          // 处理收到的消息
          const messageContent = JSON.parse(event.message?.content || '{}').text
          console.log('Received message:', messageContent)

          // 发送确认回复
          await sendMessageToFeishu(`收到消息: ${messageContent}\n\n任务已收到，我将开始处理...`)
          break
        default:
          console.log('Unhandled event type:', event?.type)
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
      type,
      content: content.substring(0, 100) // 截取前100字符日志
    })

  } catch (error) {
    console.error('Feishu webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}

// GET - 验证Webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')

  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({
    status: 'ok',
    service: 'Feishu Webhook',
    description: '飞书机器人任务接收端点',
    usage: '在飞书群中添加自定义机器人，配置WebHook地址指向此端点'
  })
}
