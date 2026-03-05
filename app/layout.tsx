import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AuraWed AI | 沉浸式婚礼美学策划平台',
  description: '将繁琐的婚礼需求采集转化为一场"心理学驱动的浪漫主义冒险"',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}
