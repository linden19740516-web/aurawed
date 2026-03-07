'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import { forgotPassword } from '@/lib/auth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email) {
      setError('请输入邮箱地址')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址')
      setIsLoading(false)
      return
    }

    const result = await forgotPassword(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || '发送失败，请重试')
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-luxury-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl card-luxury text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-display text-2xl text-white mb-4">邮件已发送</h1>
          <p className="text-aurora-muted mb-6">
            我们已向 <span className="text-white">{email}</span> 发送了密码重置链接，请查收邮件并点击链接重置密码。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-aurora-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-luxury-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-aurora-muted hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>

        <div className="p-8 rounded-2xl card-luxury">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-aurora-gold/20 flex items-center justify-center">
              <Lock className="w-7 h-7 text-aurora-gold" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">忘记密码</h1>
            <p className="text-aurora-muted">
              输入您的邮箱地址，我们将发送密码重置链接
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-aurora-muted mb-2">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  className="w-full pl-12 pr-4 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
              </div>
            </div>

            {error && (
              <p className="text-aurora-rose-light text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl btn-gold text-aurora-dark font-semibold disabled:opacity-50"
            >
              {isLoading ? '发送中...' : '发送重置链接'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}
