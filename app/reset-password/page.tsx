'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { resetPassword } from '@/lib/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)

  useEffect(() => {
    // 检查是否有有效的重置令牌
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) {
      setIsValidToken(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!password) {
      setError('请输入新密码')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    const result = await resetPassword(password)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || '重置失败，请重试')
    }

    setIsLoading(false)
  }

  if (!isValidToken) {
    return (
      <main className="min-h-screen bg-luxury-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl card-luxury text-center"
        >
          <h1 className="font-display text-2xl text-white mb-4">链接无效</h1>
          <p className="text-aurora-muted mb-6">
            密码重置链接已失效或已过期，请重新发起密码重置请求。
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-aurora-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            重新发起重置
          </Link>
        </motion.div>
      </main>
    )
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
          <h1 className="font-display text-2xl text-white mb-4">密码重置成功</h1>
          <p className="text-aurora-muted mb-6">
            您的密码已成功重置，请使用新密码登录。
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl btn-gold text-aurora-dark font-semibold"
          >
            立即登录
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
            <h1 className="font-display text-3xl text-white mb-2">重置密码</h1>
            <p className="text-aurora-muted">
              请输入您的新密码
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-aurora-muted mb-2">新密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  className="w-full pl-12 pr-12 py-3 rounded-xl input-luxury text-white placeholder:text-aurora-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-aurora-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-aurora-muted mb-2">确认新密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
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
              {isLoading ? '重置中...' : '确认重置'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-aurora-dark">加载中...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
